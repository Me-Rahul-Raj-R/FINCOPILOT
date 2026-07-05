const express = require("express");
const { authenticate } = require("../middleware/auth");
const router = express.Router();
const { summary } = require("../controllers/dashboardController");

router.get("/summary", authenticate, summary);

module.exports = router;
