const express = require("express");
const { authenticate, requireAdmin } = require("../middleware/auth");
const router = express.Router();
const { overview, listUsers, setUserRole } = require("../controllers/adminController");

router.use(authenticate, requireAdmin);
router.get("/overview", overview);
router.get("/users", listUsers);
router.patch("/users/:id/role", setUserRole);

module.exports = router;
