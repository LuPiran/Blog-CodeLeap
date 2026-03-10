// Vercel serverless entrypoint for the Express app
// Uses serverless-http so Express receives a proper Node-like req/res and
// can handle OPTIONS preflight and CORS correctly.

const serverless = require("serverless-http");
const app = require("../server");

module.exports = serverless(app);
