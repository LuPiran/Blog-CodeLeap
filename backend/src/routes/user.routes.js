const router = require("express").Router();
const multer = require("multer");

const authMiddleware = require("../middleware/auth.middleware");
const userController = require("../controllers/user.controller");

const upload = multer({ storage: multer.memoryStorage() });

router.get("/me", authMiddleware, userController.getMe);

router.put(
  "/me",
  authMiddleware,
  upload.single("avatar"),
  userController.updateMe,
);

module.exports = router;

