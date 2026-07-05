const express = require("express");
const { authenticate } = require("../middleware/auth");
const router = express.Router();
const { posture } = require("../controllers/cyberController");

router.get("/posture", authenticate, posture);

module.exports = router;
