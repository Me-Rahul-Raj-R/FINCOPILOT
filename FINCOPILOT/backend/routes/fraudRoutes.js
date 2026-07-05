const express = require("express");
const { authenticate } = require("../middleware/auth");
const router = express.Router();
const { checkTransaction, listTransactions } = require("../controllers/fraudController");

router.use(authenticate);
router.post("/check", checkTransaction);
router.get("/", listTransactions);

module.exports = router;
