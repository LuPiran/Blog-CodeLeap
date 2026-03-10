require("dotenv").config();

const express = require("express");
const cors = require("cors");

const postRoutes = require("./src/routes/post.routes");
const commentRoutes = require("./src/routes/comment.routes");
const userRoutes = require("./src/routes/user.routes");
const errorHandler = require("./src/middleware/errorHandler.middleware");

const app = express();

// Configurações básicas
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
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

