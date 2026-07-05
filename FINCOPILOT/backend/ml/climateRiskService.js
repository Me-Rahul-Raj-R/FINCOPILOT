/**
 * Climate-risk adjusted lending score.
 *
 * Real climate-risk underwriting needs decades of hazard and exposure
 * data that a single bank rarely owns outright (this is precisely the
 * "data scarcity" problem RBI's draft disclosure framework flags). This
 * service demonstrates the *scoring architecture* a bank could plug
 * real hazard datasets into: an industry exposure index x a regional
 * physical-hazard index x tenure amplification.
 */

const INDUSTRY_EXPOSURE = {
  Agriculture: 0.85,
  "Coastal Real Estate": 0.8,
  Fisheries: 0.78,
  Tourism: 0.55,
  Textiles: 0.5,
  Manufacturing: 0.45,
  Infrastructure: 0.4,
  Healthcare: 0.2,
  "IT Services": 0.12,
  "Financial Services": 0.1,
};

const REGION_HAZARD = {
  "Coastal Tamil Nadu": 0.8,
  "Coastal Odisha": 0.85,
  "Coastal Maharashtra": 0.75,
  Kerala: 0.7,
  "Indo-Gangetic Plain (UP/Bihar)": 0.6,
  "Vidarbha (Maharashtra)": 0.55,
  Rajasthan: 0.5,
  "Deccan Plateau (Karnataka)": 0.35,
  "Delhi NCR": 0.3,
  "North-East Hill States": 0.55,
};

function recommendationFor(adjustedScore, baselineScore) {
  const delta = adjustedScore - baselineScore;
  if (delta < 5)
    return "Climate exposure immaterial for this tenure - standard underwriting applies.";
  if (delta < 15)
    return "Moderate exposure - consider a climate risk premium or parametric insurance covenant.";
  return "High long-term physical-climate exposure - recommend shorter tenure, collateral re-valuation clause, or mandatory climate-risk insurance before sanction.";
}

function assess({ industry, region, loanTenureYears, baselineRiskScore = 40 }) {
  const exposure = INDUSTRY_EXPOSURE[industry] ?? 0.4;
  const hazard = REGION_HAZARD[region] ?? 0.4;

  // Tenure amplifies physical risk: a 20-year loan carries far more
  // multi-decade climate exposure than a 2-year working-capital loan.
  const tenureAmplifier = Math.min(2.2, 1 + loanTenureYears / 12);

  const climatePremium = exposure * hazard * tenureAmplifier * 35; // 0-~70 points
  const climateAdjustedRiskScore = Math.min(
    100,
    Math.round(baselineRiskScore + climatePremium)
  );
  const riskPremiumPct = Math.round(climatePremium * 10) / 10;

  return {
    industryExposureIndex: exposure,
    regionHazardIndex: hazard,
    baselineRiskScore,
    climateAdjustedRiskScore,
    riskPremiumPct,
    recommendation: recommendationFor(climateAdjustedRiskScore, baselineRiskScore),
  };
}

module.exports = {
  assess,
  INDUSTRY_EXPOSURE,
  REGION_HAZARD,
};
