require("dotenv").config();

const express = require("express");
const cors = require("cors");

const postRoutes = require("./src/routes/post.routes");
const commentRoutes = require("./src/routes/comment.routes");
const userRoutes = require("./src/routes/user.routes");
const errorHandler = require("./src/middleware/errorHandler.middleware");

const app = express();

// Restaura req.url quando a requisição vem de um rewrite do Vercel (api/:path* -> api?path=:path*)
// para que o Express encaminhe corretamente para /api/users, /api/posts, etc.
app.use((req, res, next) => {
  const path = req.query.path;
  if (path !== undefined) {
    delete req.query.path;
    const qs = Object.keys(req.query).length ? "?" + new URLSearchParams(req.query).toString() : "";
    req.url = "/api" + (path ? "/" + path : "") + qs;
  }
  next();
});

// Configurações básicas
const PORT = process.env.PORT || 3000;
// Suporta múltiplas origens separadas por vírgula; aceita também qualquer *.vercel.app
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
const allowedOrigins = CORS_ORIGIN === "*"
  ? "*"
  : CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins === "*") return true;
  if (allowedOrigins.includes(origin)) return true;
  // Permite qualquer preview/produção do Vercel (*.vercel.app)
  try {
    const url = new URL(origin);
    if (url.hostname.endsWith(".vercel.app")) return true;
  } catch (_) {}
  return false;
};

app.use(
  cors({
    origin: (origin, cb) => {
      if (isOriginAllowed(origin)) {
        cb(null, origin || true);
      } else {
        cb(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

// Rotas da API
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);

// Healthcheck simples
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Middleware de rota não encontrada (após errorHandler para erros explícitos)
app.use((req, res) => {
  res.status(404).json({ message: "Rota não encontrada" });
});

// Exporta o app para ser usado em ambientes serverless (Vercel)
module.exports = app;

// Inicialização do servidor apenas em ambiente local (não Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

