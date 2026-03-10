// Vercel serverless entrypoint for the Express app
// This file is used when the backend project is deployed with root = backend
// on Vercel. It forwards all /api/* requests to the Express app defined in
// server.js.

const app = require("../server");

module.exports = (req, res) => {
  app(req, res);
};

