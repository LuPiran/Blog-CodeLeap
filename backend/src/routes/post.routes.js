const router = require("express").Router();
const multer = require("multer");

const postController = require("../controllers/post.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Configuração de upload em memória (as imagens irão para o Supabase Storage)
const upload = multer({ storage: multer.memoryStorage() });

// Lista de posts públicos
router.get("/", postController.getPosts);
router.get("/:id", postController.getPostById);

// Rotas protegidas por autenticação
router.post(
  "/",
  authMiddleware,
  upload.array("images"),
  postController.createPost,
);

router.patch(
  "/:id",
  authMiddleware,
  upload.array("newImages"),
  postController.updatePost,
);

router.delete("/:id", authMiddleware, postController.deletePost);

router.post("/:id/like", authMiddleware, postController.toggleLike);

module.exports = router;

