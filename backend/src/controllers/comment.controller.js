const commentService = require("../services/comment.service");

exports.createComment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { postId, comment, parentCommentId } = req.body;

    const created = await commentService.createComment({
      postId,
      userId,
      comment,
      parentCommentId,
    });

    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

exports.updateComment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { comment } = req.body;

    const updated = await commentService.updateComment(id, userId, comment);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await commentService.deleteComment(id, userId);

    res.json({ message: "Comentário deletado com sucesso." });
  } catch (error) {
    next(error);
  }
};

exports.toggleLike = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await commentService.toggleLikeOnComment(id, userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

