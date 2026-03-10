const router = require("express").Router();

const authMiddleware = require("../middleware/auth.middleware");
const commentController = require("../controllers/comment.controller");

// criação de comentário ou reply
router.post("/", authMiddleware, commentController.createComment);

// atualizar comentário
router.patch("/:id", authMiddleware, commentController.updateComment);

// deletar comentário
router.delete("/:id", authMiddleware, commentController.deleteComment);

// like/unlike comentário
router.post("/:id/like", authMiddleware, commentController.toggleLike);

module.exports = router;

