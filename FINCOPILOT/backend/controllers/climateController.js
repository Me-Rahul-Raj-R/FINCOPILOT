const { getModels } = require("../models");
const memoryStore = require("../utils/memoryStore");
const climateRiskService = require("../ml/climateRiskService");

async function assess(req, res) {
  try {
    const body = req.body || {};
    const required = ["borrowerName", "industry", "region", "loanTenureYears", "loanAmount"];
    const missing = required.filter((f) => body[f] === undefined || body[f] === "");
    if (missing.length) {
      return res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
    }

    const result = climateRiskService.assess({
      industry: body.industry,
      region: body.region,
      loanTenureYears: Number(body.loanTenureYears),
    });

    const record = { ...body, ...result, userId: req.user.id };

    const saved = global.FINCOPILOT_DEMO_MODE
      ? memoryStore.insertClimateAssessment(record)
      : await getModels().ClimateAssessment.create(record);

    res.status(201).json(saved);
  } catch (err) {
    console.error("[climateController] assess error:", err);
    res.status(500).json({ error: "Failed to run climate risk assessment" });
  }
}

function options(req, res) {
  res.json({
    industries: Object.keys(climateRiskService.INDUSTRY_EXPOSURE),
    regions: Object.keys(climateRiskService.REGION_HAZARD),
  });
}

async function list(req, res) {
  try {
    const isAdmin = req.user.role === "admin";
    const records = global.FINCOPILOT_DEMO_MODE
      ? memoryStore.recent("climateAssessments", 25, isAdmin ? null : req.user.id)
      : await getModels().ClimateAssessment.findAll({
          where: isAdmin ? {} : { userId: req.user.id },
          order: [["createdAt", "DESC"]],
          limit: 25,
        });
    res.json(records);
  } catch (err) {
    console.error("[climateController] list error:", err);
    res.status(500).json({ error: "Failed to fetch climate assessments" });
  }
}

module.exports = { assess, options, list };
