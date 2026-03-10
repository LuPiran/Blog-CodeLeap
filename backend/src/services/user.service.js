const supabase = require("../config/supabaseClient");
const { uploadUserAvatar } = require("./storage.service");

exports.getMe = async (userId, fallbackProfile) => {
  const { data, error } = await supabase
    .from("users")
    .select("id, username, email, avatar_url")
    .eq("id", userId)
    .single();

  // Quando não existe registro, o PostgREST retorna um erro com código PGRST116
  if (error && error.code === "PGRST116") {
    if (!fallbackProfile) {
      return null;
    }

    const baseEmail = fallbackProfile.email;
    const baseName =
      fallbackProfile.username ||
      fallbackProfile.name ||
      (baseEmail ? baseEmail.split("@")[0] : "user");

    const { data: created, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          id: userId,
          username: baseName,
          email: baseEmail,
          avatar_url: fallbackProfile.avatar_url || null,
        },
      ])
      .select("id, username, email, avatar_url")
      .single();

    if (insertError) {
      throw insertError;
    }

    return created;
  }

  if (error) {
    throw error;
  }

  return data;
};

exports.updateMe = async (userId, { username }, avatarFile) => {
  const updates = {};

  if (username) {
    updates.username = username;
  }

  let avatarUrl;

  if (avatarFile) {
    const user = await this.getMe(userId);
    const { publicUrl } = await uploadUserAvatar({ user, file: avatarFile });
    avatarUrl = publicUrl;
    updates.avatar_url = publicUrl;
  }

  if (Object.keys(updates).length === 0) {
    return this.getMe(userId);
  }

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select("id, username, email, avatar_url")
    .single();

  if (error) {
    throw error;
  }

  return data;
};

