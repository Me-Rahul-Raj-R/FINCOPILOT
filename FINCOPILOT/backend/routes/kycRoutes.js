const express = require("express");
const { authenticate } = require("../middleware/auth");
const router = express.Router();
const { generateChallenge, submitKyc, listKyc } = require("../controllers/kycController");

router.use(authenticate);
router.get("/challenge", generateChallenge);
router.post("/", submitKyc);
router.get("/", listKyc);

module.exports = router;
