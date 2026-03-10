const supabase = require("../config/supabaseClient");
const storageService = require("./storage.service");
const { extractTagsAndMentions } = require("../utils/text.utils");

async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("id, username, avatar_url")
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

exports.createPost = async ({ title, description, userId, tags, images }) => {
  if (!title || !description || !userId) {
    throw new Error("Título, descrição e usuário são obrigatórios.");
  }

  const user = await getUserProfile(userId);
  const { parsedTags } = extractTagsAndMentions(`${title} ${description}`, tags);

  const { data: createdPosts, error: postError } = await supabase
    .from("posts")
    .insert([
      {
        title,
        description,
        user_id: userId,
        tags: parsedTags,
      },
    ])
    .select()
    .single();

  if (postError) {
    throw postError;
  }

  let uploadedImages = [];

  if (images && images.length > 0) {
    uploadedImages = await storageService.uploadPostImages({
      user,
      postId: createdPosts.id,
      files: images,
    });
  }

  if (uploadedImages.length > 0) {
    const { error: imagesError } = await supabase.from("post_images").insert(
      uploadedImages.map((img) => ({
        post_id: createdPosts.id,
        image_url: img.path,
      })),
    );

    if (imagesError) {
      // Em um sistema real, aqui poderíamos tentar rollback no storage
      throw imagesError;
    }
  }

  return { ...createdPosts, images: uploadedImages };
};

exports.getAllPosts = async () => {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      users ( username, avatar_url ),
      post_images ( id, image_url ),
      likes ( id, user_id ),
      comments ( id )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

exports.getPostById = async (postId) => {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      users ( username, avatar_url ),
      post_images ( id, image_url ),
      likes ( id, user_id ),
      comments (
        id,
        comment,
        user_id,
        parent_comment_id,
        created_at,
        users ( username, avatar_url ),
        likes ( id, user_id )
      )
    `,
    )
    .eq("id", postId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data;
};

exports.updatePost = async (
  postId,
  userId,
  { title, description, tags, imagesToKeep, newImages },
) => {
  const { data: existingPost, error: fetchError } = await supabase
    .from("posts")
    .select("id, user_id, title, description, tags, users ( username )")
    .eq("id", postId)
    .single();

  if (fetchError || !existingPost) {
    throw new Error("Post não encontrado.");
  }

  if (existingPost.user_id !== userId) {
    const err = new Error("Você não tem permissão para editar este post.");
    err.status = 403;
    throw err;
  }

  const user = await getUserProfile(userId);

  // Buscar imagens atuais do post
  const { data: currentImages, error: imagesFetchError } = await supabase
    .from("post_images")
    .select("id, image_url")
    .eq("post_id", postId);

  if (imagesFetchError) {
    throw imagesFetchError;
  }

  const keep = new Set(imagesToKeep || []);
  const toDelete = (currentImages || []).filter(
    (img) => !keep.has(img.image_url),
  );

  if (toDelete.length > 0) {
    await storageService.deletePostImages({
      user,
      postId,
      images: toDelete,
    });

    const { error: deleteDbError } = await supabase
      .from("post_images")
      .delete()
      .in(
        "id",
        toDelete.map((img) => img.id),
      );

    if (deleteDbError) {
      throw deleteDbError;
    }
  }

  let uploadedImages = [];

  if (newImages && newImages.length > 0) {
    uploadedImages = await storageService.uploadPostImages({
      user,
      postId,
      files: newImages,
    });

    if (uploadedImages.length > 0) {
      const { error: insertImagesError } = await supabase
        .from("post_images")
        .insert(
          uploadedImages.map((img) => ({
            post_id: postId,
            image_url: img.path,
          })),
        );

      if (insertImagesError) {
        throw insertImagesError;
      }
    }
  }

  const { parsedTags } = extractTagsAndMentions(
    `${title || existingPost.title} ${description || existingPost.description}`,
    tags,
  );

  const { data: updatedPost, error: updateError } = await supabase
    .from("posts")
    .update({
      title: title ?? existingPost.title,
      description: description ?? existingPost.description,
      tags: parsedTags ?? existingPost.tags,
    })
    .eq("id", postId)
    .select()
    .single();

  if (updateError) {
    throw updateError;
  }

  return {
    ...updatedPost,
    images: [...(currentImages || []).filter((img) => keep.has(img.image_url)), ...uploadedImages],
  };
};

exports.deletePost = async (postId, userId) => {
  const { data: existingPost, error: fetchError } = await supabase
    .from("posts")
    .select("id, user_id")
    .eq("id", postId)
    .single();

  if (fetchError || !existingPost) {
    throw new Error("Post não encontrado.");
  }

  if (existingPost.user_id !== userId) {
    const err = new Error("Você não tem permissão para deletar este post.");
    err.status = 403;
    throw err;
  }

  const user = await getUserProfile(userId);

  // Buscar todas as imagens relacionadas ao post
  const { data: images, error: imagesError } = await supabase
    .from("post_images")
    .select("id, image_url")
    .eq("post_id", postId);

  if (imagesError) {
    throw imagesError;
  }

  if (images && images.length > 0) {
    await storageService.deletePostImages({ user, postId, images });
  }

  // Deleção em cascata pode ser configurada no banco.
  const { error: deleteError } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId);

  if (deleteError) {
    throw deleteError;
  }
};

exports.toggleLikeOnPost = async (postId, userId) => {
  // Verifica se já existe like para este post
  const { data: existing, error: existingError } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", postId)
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
      .insert([{ user_id: userId, post_id: postId }]);

    if (insertError) {
      throw insertError;
    }

    liked = true;
  }

  const { count, error: countError } = await supabase
    .from("likes")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId);

  if (countError) {
    throw countError;
  }

  return { liked, likesCount: count || 0 };
};


