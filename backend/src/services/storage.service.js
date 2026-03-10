const supabase = require("../config/supabaseClient");

const BUCKET_NAME = "usuarios";

function buildUserFolder(user) {
  const username = user.username || user.user_metadata?.username || "user";
  return `${username}_${user.id}`;
}

exports.buildUserFolder = buildUserFolder;

exports.uploadPostImages = async ({ user, postId, files }) => {
  const userFolder = buildUserFolder(user);
  const results = [];

  for (const file of files) {
    const fileExt = file.originalname.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}.${fileExt}`;

    const path = `${userFolder}/${postId}/${fileName}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    results.push({ path });
  }

  return results;
};

exports.deletePostImages = async ({ user, postId, images }) => {
  const userFolder = buildUserFolder(user);

  const paths = images.map((img) => {
    // Se no banco estiver salvo o path completo já no formato desejado,
    // usamos diretamente. Caso contrário, garantimos a estrutura.
    if (img.image_url.startsWith(`${userFolder}/${postId}/`)) {
      return img.image_url;
    }

    return `${userFolder}/${postId}/${img.image_url}`;
  });

  const { error } = await supabase.storage.from(BUCKET_NAME).remove(paths);

  if (error) {
    throw error;
  }
};

exports.uploadUserAvatar = async ({ user, file }) => {
  if (!file) {
    throw new Error("Arquivo de avatar não enviado.");
  }

  const userFolder = buildUserFolder(user);
  const fileExt = file.originalname.split(".").pop();
  const path = `${userFolder}/imagem_usuario.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);

  return { path, publicUrl };
};

