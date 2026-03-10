const supabase = require("../config/supabaseClient");

module.exports = async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Token de autenticação não fornecido." });
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: "Token de autenticação inválido." });
    }

    req.user = {
      id: user.id,
      email: user.email,
      ...user.user_metadata,
    };

    next();
  } catch (err) {
    next(err);
  }
};

