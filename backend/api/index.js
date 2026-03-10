// Vercel serverless entrypoint: todas as rotas /api e /api/* são enviadas aqui via
// vercel.json (rewrite /api/:path* -> /api?path=:path*). O Express restaura req.url
// no server.js e trata CORS + rotas normalmente.
const app = require("../server");

module.exports = (req, res) => {
  app(req, res);
};

