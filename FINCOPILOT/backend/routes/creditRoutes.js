const express = require("express");
const { authenticate } = require("../middleware/auth");
const router = express.Router();
const { submitApplication, listApplications } = require("../controllers/creditController");

router.use(authenticate);
router.post("/", submitApplication);
router.get("/", listApplications);

module.exports = router;
