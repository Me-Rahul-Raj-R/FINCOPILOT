const express = require("express");
const router = express.Router();
const { registerClient } = require("../utils/notificationService");
const { protect } = require("../middleware/auth");

router.get("/stream", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });

  // Write initial connection success event
  res.write("data: {\"type\":\"connected\",\"message\":\"Connected to FinCopilot Live Stream\"}\n\n");

  const unregister = registerClient(res);

  req.on("close", () => {
    unregister();
  });
});

module.exports = router;
