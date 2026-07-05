const express = require("express");
const { authenticate } = require("../middleware/auth");
const router = express.Router();
const { getWallet, contacts, sendMoney, billPay } = require("../controllers/walletController");

router.use(authenticate);
router.get("/", getWallet);
router.get("/contacts", contacts);
router.post("/send", sendMoney);
router.post("/bill-pay", billPay);

module.exports = router;
