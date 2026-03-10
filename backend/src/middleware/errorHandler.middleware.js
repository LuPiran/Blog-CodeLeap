module.exports = function errorHandler(err, req, res, next) {
  // Se já foi enviada alguma resposta, delega para o Express
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;

  // Log estruturado no servidor para facilitar o debug
  // eslint-disable-next-line no-console
  console.error(
    `[ERROR] ${new Date().toISOString()} ${req.method} ${req.originalUrl} ->`,
    {
      status,
      message: err.message,
      stack: err.stack,
    },
  );

  // Evita vazar detalhes sensíveis em produção
  const payload = {
    message: err.message || "Erro interno do servidor.",
  };

  if (process.env.NODE_ENV !== "production" && err.stack) {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
};

