const { getModels } = require("../models");
const memoryStore = require("../utils/memoryStore");
const { parsePagination, paginatedResponse } = require("../utils/paginate");

async function overview(req, res) {
  try {
    if (global.FINCOPILOT_DEMO_MODE) {
      return res.json({ mode: "DEMO", ...memoryStore.adminOverview() });
    }

    const { User, LoanApplication, Transaction, KycRecord, ClimateAssessment } = getModels();
    const [totalUsers, admins, totalLoans, highRiskLoans, totalTxns, blockedDocs, totalKyc, approvedKyc, climateAssessments, climateFlagged] =
      await Promise.all([
        User.count(),
        User.count({ where: { role: "admin" } }),
        LoanApplication.count(),
        LoanApplication.count({ where: { riskCategory: "High" } }),
        Transaction.count(),
        Transaction.findAll({ where: { decision: ["BLOCK", "HOLD_FOR_REVIEW"] } }),
        KycRecord.count(),
        KycRecord.count({ where: { status: "APPROVED" } }),
        ClimateAssessment.count(),
        ClimateAssessment.count({
          where: getModels().sequelize.where(
            getModels().sequelize.literal("`climateAdjustedRiskScore` - `baselineRiskScore`"),
            ">",
            10
          ),
        }),
      ]);

    const blockedAmount = blockedDocs.reduce((s, t) => s + t.amount, 0);

    res.json({
      mode: "PERSISTENT",
      totalUsers,
      admins,
      totalLoans,
      highRiskLoans,
      totalTxns,
      blockedTxns: blockedDocs.length,
      blockedAmount,
      totalKyc,
      kycApprovalRate: totalKyc ? Math.round((approvedKyc / totalKyc) * 100) : 0,
      climateAssessments,
      climateFlagged,
    });
  } catch (err) {
    console.error("[adminController] overview error:", err);
    res.status(500).json({ error: "Failed to load admin overview" });
  }
}

async function listUsers(req, res) {
  try {
    const { page, pageSize, offset, limit } = parsePagination(req.query, { defaultSize: 25, maxSize: 100 });

    let rows, count;
    if (global.FINCOPILOT_DEMO_MODE) {
      const all = memoryStore.listUsers();
      count = all.length;
      rows = all.slice(offset, offset + limit);
    } else {
      const { User } = getModels();
      const result = await User.findAndCountAll({ order: [["createdAt", "DESC"]], offset, limit });
      rows = result.rows.map((u) => u.get({ plain: true }));
      count = result.count;
    }

    const mapped = rows.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt }));
    res.json(paginatedResponse(mapped, count, { page, pageSize }));
  } catch (err) {
    console.error("[adminController] listUsers error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

async function setUserRole(req, res) {
  try {
    const { role } = req.body || {};
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "role must be 'user' or 'admin'" });
    }
    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({ error: "You can't change your own role" });
    }

    let updated;
    if (global.FINCOPILOT_DEMO_MODE) {
      updated = memoryStore.updateUserRole(req.params.id, role);
    } else {
      const { User } = getModels();
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      user.role = role;
      await user.save();
      updated = user;
    }

    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json({ id: updated.id, name: updated.name, email: updated.email, role: updated.role });
  } catch (err) {
    console.error("[adminController] setUserRole error:", err);
    res.status(500).json({ error: "Failed to update role" });
  }
}

module.exports = { overview, listUsers, setUserRole };
