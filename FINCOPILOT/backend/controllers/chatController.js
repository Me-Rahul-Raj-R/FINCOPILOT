const ragService = require("../ml/ragService");

function chat(req, res) {
  const message = (req.body && req.body.message) || "";
  const { reply, sources } = ragService.answer(message);
  res.json({ reply, sources });
}

module.exports = { chat };
