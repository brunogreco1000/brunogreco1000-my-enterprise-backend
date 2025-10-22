// backend/api.js
const server = require('./dist/server').default;

module.exports = (req, res) => {
  server(req, res);
};
