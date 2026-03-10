const userService = require("../services/user.service");

exports.getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const me = await userService.getMe(userId, {
      email: req.user.email,
      username: req.user.username || req.user.name,
      avatar_url: req.user.avatar_url,
    });
    res.json(me);
  } catch (error) {
    next(error);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { username } = req.body;
    const avatarFile = req.file;

    const updated = await userService.updateMe(userId, { username }, avatarFile);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

