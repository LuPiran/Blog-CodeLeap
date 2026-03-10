const postService = require("../services/post.service");

exports.createPost = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.body.user_id;
    const payload = {
      title: req.body.title,
      description: req.body.description,
      userId,
      tags: req.body.tags,
      images: req.files || [],
    };

    const post = await postService.createPost(payload);
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

exports.getPosts = async (req, res, next) => {
  try {
    const posts = await postService.getAllPosts();
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

exports.getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await postService.getPostById(id);

    if (!post) {
      return res.status(404).json({ message: "Post não encontrado" });
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.body.user_id;

    const payload = {
      title: req.body.title,
      description: req.body.description,
      tags: req.body.tags,
      imagesToKeep: req.body.imagesToKeep || [],
      newImages: req.files || [],
    };

    const post = await postService.updatePost(id, userId, payload);
    res.json(post);
  } catch (error) {
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.body.user_id;

    await postService.deletePost(id, userId);

    res.json({ message: "Post deletado com sucesso" });
  } catch (error) {
    next(error);
  }
};

exports.toggleLike = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await postService.toggleLikeOnPost(id, userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};


