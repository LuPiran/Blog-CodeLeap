const supabase = require("../config/supabaseClient");

exports.createComment = async ({ postId, userId, comment, parentCommentId }) => {
  if (!postId || !userId || !comment) {
    throw new Error("Post, usuário e comentário são obrigatórios.");
  }

  const { data, error } = await supabase
    .from("comments")
    .insert([
      {
        post_id: postId,
        user_id: userId,
        comment,
        parent_comment_id: parentCommentId || null,
      },
    ])
    .select(
      `
      id,
      post_id,
      user_id,
      comment,
      parent_comment_id,
      created_at,
      users ( username, avatar_url )
    `,
    )
    .single();

  if (error) {
    throw error;
  }

  return data;
};

exports.updateComment = async (commentId, userId, newComment) => {
  const { data: existing, error: fetchError } = await supabase
    .from("comments")
    .select("id, user_id")
    .eq("id", commentId)
    .single();

  if (fetchError || !existing) {
    throw new Error("Comentário não encontrado.");
  }

  if (existing.user_id !== userId) {
    const err = new Error("Você não pode editar este comentário.");
    err.status = 403;
    throw err;
  }

  const { data, error } = await supabase
    .from("comments")
    .update({ comment: newComment })
    .eq("id", commentId)
    .select(
      `
      id,
      post_id,
      user_id,
      comment,
      parent_comment_id,
      created_at,
      users ( username, avatar_url )
    `,
    )
    .single();

  if (error) {
    throw error;
  }

  return data;
};

exports.deleteComment = async (commentId, userId) => {
  const { data: existing, error: fetchError } = await supabase
    .from("comments")
    .select("id, user_id")
    .eq("id", commentId)
    .single();

  if (fetchError || !existing) {
    throw new Error("Comentário não encontrado.");
  }

  if (existing.user_id !== userId) {
    const err = new Error("Você não pode deletar este comentário.");
    err.status = 403;
    throw err;
  }

  const { error } = await supabase.from("comments").delete().eq("id", commentId);

  if (error) {
    throw error;
  }
};

exports.toggleLikeOnComment = async (commentId, userId) => {
  // Verifica se já existe like
  const { data: existing, error: existingError } = await supabase
    .from("likes")
    .select("id")
    .eq("comment_id", commentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  let liked;

  if (existing) {
    const { error: deleteError } = await supabase
      .from("likes")
      .delete()
      .eq("id", existing.id);

    if (deleteError) {
      throw deleteError;
    }

    liked = false;
  } else {
    const { error: insertError } = await supabase
      .from("likes")
      .insert([{ user_id: userId, comment_id: commentId }]);

    if (insertError) {
      throw insertError;
    }

    liked = true;
  }

  const { count, error: countError } = await supabase
    .from("likes")
    .select("id", { count: "exact", head: true })
    .eq("comment_id", commentId);

  if (countError) {
    throw countError;
  }

  return { liked, likesCount: count || 0 };
};

