const express = require("express");
const { authenticate } = require("../middleware/auth");
const router = express.Router();
const { assess, options, list } = require("../controllers/climateController");

router.use(authenticate);
router.get("/options", options);
router.post("/assess", assess);
router.get("/", list);

module.exports = router;
