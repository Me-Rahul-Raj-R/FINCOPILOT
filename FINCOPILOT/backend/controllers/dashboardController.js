const { getModels } = require("../models");
const memoryStore = require("../utils/memoryStore");

async function summary(req, res) {
  try {
    const isAdmin = req.user.role === "admin";
    const scopeUserId = isAdmin ? null : req.user.id;

    if (global.FINCOPILOT_DEMO_MODE) {
      return res.json({ mode: "DEMO", scope: isAdmin ? "ALL_USERS" : "YOU", ...memoryStore.stats(scopeUserId) });
    }

    const { LoanApplication, Transaction, KycRecord, ClimateAssessment } = getModels();
    const where = scopeUserId ? { userId: scopeUserId } : {};

    const [totalLoans, highRiskLoans, totalTxns, blockedDocs, totalKyc, approvedKyc, climateAssessments] =
      await Promise.all([
        LoanApplication.count({ where }),
        LoanApplication.count({ where: { ...where, riskCategory: "High" } }),
        Transaction.count({ where }),
        Transaction.findAll({ where: { ...where, decision: ["BLOCK", "HOLD_FOR_REVIEW"] } }),
        KycRecord.count({ where }),
        KycRecord.count({ where: { ...where, status: "APPROVED" } }),
        ClimateAssessment.count({ where }),
      ]);

    const blockedAmount = blockedDocs.reduce((s, t) => s + t.amount, 0);

    res.json({
      mode: "PERSISTENT",
      scope: isAdmin ? "ALL_USERS" : "YOU",
      totalLoans,
      highRiskLoans,
      totalTxns,
      blockedTxns: blockedDocs.length,
      blockedAmount,
      totalKyc,
      kycApprovalRate: totalKyc ? Math.round((approvedKyc / totalKyc) * 100) : 0,
      climateAssessments,
      climateFlagged: 0,
    });
  } catch (err) {
    console.error("[dashboardController] summary error:", err);
    res.status(500).json({ error: "Failed to load dashboard summary" });
  }
}

module.exports = { summary };
