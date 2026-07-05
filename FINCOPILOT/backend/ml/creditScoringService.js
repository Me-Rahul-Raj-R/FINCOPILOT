const { LogisticRegression } = require("../ml/logisticRegression");
const { generateDataset } = require("../data/syntheticCreditData");

const FEATURE_NAMES = [
  "Debt-to-income ratio",
  "Credit utilization",
  "Late payments (24m)",
  "Loan-to-value ratio",
  "Years employed",
  "Existing NPA flag",
];

let model = null;

/** Trains once, lazily, and caches the model in memory for the process lifetime. */
function getModel() {
  if (!model) {
    console.log("[ml] Training credit-risk logistic regression on synthetic data...");
    const { X, y } = generateDataset(3000);
    model = new LogisticRegression({ learningRate: 0.15, epochs: 1200, l2: 0.001 });
    model.fit(X, y);
    console.log("[ml] Credit-risk model ready.");
  }
  return model;
}

function toRiskScore(probabilityOfDefault) {
  // Map probability of default -> a CIBIL-like 300-900 score (inverted: higher is safer)
  const score = 900 - probabilityOfDefault * 600;
  return Math.round(Math.max(300, Math.min(900, score)));
}

function categorize(probabilityOfDefault) {
  if (probabilityOfDefault < 0.15) return "Low";
  if (probabilityOfDefault < 0.4) return "Medium";
  return "High";
}

function decisionFor(category) {
  return {
    Low: "Approve",
    Medium: "Approve with conditions / collateral review",
    High: "Refer to credit committee / decline",
  }[category];
}

/**
 * @param {object} input - applicant figures from the request body
 * @returns full scoring result with explainability
 */
function scoreApplicant(input) {
  const m = getModel();

  const debtToIncomeRatio = input.monthlyEmiOutgo / input.monthlyIncome;
  const features = [
    debtToIncomeRatio,
    Number(input.creditUtilizationPct),
    Number(input.latePayments24m),
    Number(input.loanToValuePct),
    Number(input.yearsEmployed),
    input.existingNpaFlag ? 1 : 0,
  ];

  const probabilityOfDefault = m.predictProba(features);
  const riskScore = toRiskScore(probabilityOfDefault);
  const riskCategory = categorize(probabilityOfDefault);
  const contributions = m.featureContributions(features);

  const topFactors = contributions
    .map((weight, i) => ({
      factor: FEATURE_NAMES[i],
      weight: Math.round(weight * 1000) / 1000,
      impact: weight > 0 ? "Increases risk" : "Reduces risk",
    }))
    .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
    .slice(0, 3);

  return {
    probabilityOfDefault: Math.round(probabilityOfDefault * 1000) / 1000,
    riskScore,
    riskCategory,
    decision: decisionFor(riskCategory),
    topFactors,
    scoringMethod: "bureau-model",
  };
}

module.exports = { scoreApplicant, scoreThinFileApplicant, getModel };

/**
 * Alternative-data ("thin file") scoring path.
 *
 * Traditional bureau scoring structurally penalizes people who simply
 * haven't built a long credit history yet - young borrowers, gig workers,
 * recent immigrants. This path scores them instead on cash-flow stability
 * and utility-payment consistency, the alternative-data signals regulators
 * have pointed to as a legitimate substitute. It's a transparent weighted
 * formula rather than a trained model (there's no equivalent labeled
 * dataset to train on responsibly), which also makes it easy to audit -
 * itself part of why standardizing this has been slow industry-wide.
 */
function scoreThinFileApplicant({ utilityPaymentConsistencyPct, cashFlowStabilityScore, monthsOfAltData }) {
  const consistency = Number(utilityPaymentConsistencyPct);
  const stability = Number(cashFlowStabilityScore);
  const months = Number(monthsOfAltData);

  let score = 500 + (consistency - 50) * 3 + (stability - 50) * 2 + Math.min(months, 24) * 2;
  score = Math.round(Math.max(300, Math.min(900, score)));

  const riskCategory = score >= 700 ? "Low" : score >= 550 ? "Medium" : "High";
  const decision = decisionFor(riskCategory);

  const topFactors = [
    { factor: "Utility payment consistency", weight: Math.round((consistency - 50) * 3) / 100, impact: consistency >= 50 ? "Reduces risk" : "Increases risk" },
    { factor: "Cash-flow stability", weight: Math.round((stability - 50) * 2) / 100, impact: stability >= 50 ? "Reduces risk" : "Increases risk" },
    { factor: "Alternative-data history depth", weight: Math.round(Math.min(months, 24) * 2) / 100, impact: "Reduces risk" },
  ].sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));

  return {
    probabilityOfDefault: Math.round((1 - score / 900) * 1000) / 1000,
    riskScore: score,
    riskCategory,
    decision,
    topFactors,
    scoringMethod: "alternative-data",
  };
}
