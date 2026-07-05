/**
 * Generates a synthetic borrower dataset to train the credit-risk model.
 *
 * Why synthetic data: real bank lending/default data is private and
 * regulated. For a portfolio/demo project, we instead define a transparent
 * "ground truth" risk function (with added noise) and sample borrowers
 * from it - a common, honest technique for prototyping credit-risk ML
 * before a real, licensed bureau-data feed is available.
 *
 * Feature order (must match creditScoringService.js):
 *   [debtToIncomeRatio, creditUtilizationPct, latePayments24m,
 *    loanToValuePct, yearsEmployed, existingNpaFlag]
 */

function randn() {
  // Box-Muller transform for an approx-normal random variable
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function generateBorrower() {
  const monthlyIncome = clamp(25000 + randn() * 35000, 12000, 500000);
  const monthlyEmiOutgo = clamp(
    monthlyIncome * (0.15 + Math.random() * 0.55),
    0,
    monthlyIncome * 0.95
  );
  const debtToIncomeRatio = monthlyEmiOutgo / monthlyIncome;
  const creditUtilizationPct = clamp(10 + randn() * 30, 0, 100);
  const latePayments24m = Math.max(0, Math.round(randn() * 2 + 1));
  const loanToValuePct = clamp(50 + randn() * 25, 10, 110);
  const yearsEmployed = clamp(0.5 + Math.random() * 12, 0, 30);
  const existingNpaFlag = Math.random() < 0.06 ? 1 : 0;

  // Ground-truth risk function (logit space) + noise -> default label
  const logit =
    3.0 * debtToIncomeRatio +
    0.02 * creditUtilizationPct +
    0.5 * latePayments24m +
    0.015 * (loanToValuePct - 50) -
    0.08 * yearsEmployed +
    1.8 * existingNpaFlag -
    2.6 +
    randn() * 0.6;

  const probDefault = 1 / (1 + Math.exp(-logit));
  const defaulted = Math.random() < probDefault ? 1 : 0;

  return {
    features: [
      debtToIncomeRatio,
      creditUtilizationPct,
      latePayments24m,
      loanToValuePct,
      yearsEmployed,
      existingNpaFlag,
    ],
    label: defaulted,
    raw: {
      monthlyIncome: Math.round(monthlyIncome),
      monthlyEmiOutgo: Math.round(monthlyEmiOutgo),
      creditUtilizationPct: Math.round(creditUtilizationPct),
      latePayments24m,
      loanToValuePct: Math.round(loanToValuePct),
      yearsEmployed: Math.round(yearsEmployed * 10) / 10,
      existingNpaFlag: !!existingNpaFlag,
    },
  };
}

function generateDataset(n = 3000) {
  const X = [];
  const y = [];
  for (let i = 0; i < n; i++) {
    const b = generateBorrower();
    X.push(b.features);
    y.push(b.label);
  }
  return { X, y };
}

module.exports = { generateDataset, generateBorrower };
