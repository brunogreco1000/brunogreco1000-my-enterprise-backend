// api.ts
// Vercel serverless entrypoint
// Usamos require para evitar problemas de tipos TS
const server = require('./dist/server').default;

module.exports = server;
