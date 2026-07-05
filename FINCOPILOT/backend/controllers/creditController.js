const { getModels } = require("../models");
const memoryStore = require("../utils/memoryStore");
const { scoreApplicant, scoreThinFileApplicant } = require("../ml/creditScoringService");

const STANDARD_FIELDS = [
  "applicantName", "monthlyIncome", "monthlyEmiOutgo", "creditUtilizationPct",
  "latePayments24m", "loanToValuePct", "yearsEmployed", "loanAmount",
];
const THIN_FILE_FIELDS = [
  "applicantName", "monthlyIncome", "loanAmount",
  "utilityPaymentConsistencyPct", "cashFlowStabilityScore", "monthsOfAltData",
];

async function submitApplication(req, res) {
  try {
    const body = req.body || {};
    const thinFile = !!body.thinFile;
    const required = thinFile ? THIN_FILE_FIELDS : STANDARD_FIELDS;

    const missing = required.filter((f) => body[f] === undefined || body[f] === "");
    if (missing.length) {
      return res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
    }
    if (Number(body.monthlyIncome) <= 0) {
      return res.status(400).json({ error: "monthlyIncome must be greater than 0" });
    }

    const result = thinFile ? scoreThinFileApplicant(body) : scoreApplicant(body);

    const record = thinFile
      ? {
          applicantName: body.applicantName,
          monthlyIncome: Number(body.monthlyIncome),
          monthlyEmiOutgo: 0,
          creditUtilizationPct: 0,
          latePayments24m: 0,
          loanToValuePct: 0,
          yearsEmployed: 0,
          existingNpaFlag: false,
          loanAmount: Number(body.loanAmount),
          ...result,
          userId: req.user.id,
        }
      : { ...body, ...result, userId: req.user.id };

    const saved = global.FINCOPILOT_DEMO_MODE
      ? memoryStore.insertLoanApplication(record)
      : await getModels().LoanApplication.create(record);

    res.status(201).json(saved);
  } catch (err) {
    console.error("[creditController] submitApplication error:", err);
    res.status(500).json({ error: "Failed to score application" });
  }
}

async function listApplications(req, res) {
  try {
    const isAdmin = req.user.role === "admin";
    const records = global.FINCOPILOT_DEMO_MODE
      ? memoryStore.recent("loanApplications", 25, isAdmin ? null : req.user.id)
      : await getModels().LoanApplication.findAll({
          where: isAdmin ? {} : { userId: req.user.id },
          order: [["createdAt", "DESC"]],
          limit: 25,
        });
    res.json(records);
  } catch (err) {
    console.error("[creditController] listApplications error:", err);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
}

module.exports = { submitApplication, listApplications };
