/**
 * Mock security-posture feed for the Cyber Watch dashboard widget.
 * Numbers are illustrative/randomized within realistic bounds - this is a
 * visualization of what a SOC summary panel would surface, not a live
 * monitoring integration.
 */

const PQC_CHECKLIST = [
  { item: "Inventory all systems using RSA/ECC for data-at-rest", status: "done" },
  { item: "Classify data by retention period (>10y data is highest priority)", status: "done" },
  { item: "Pilot NIST-standardized PQC algorithm (e.g. ML-KEM) in a sandbox", status: "in_progress" },
  { item: "Hybrid classical+PQC handshake for inter-bank messaging", status: "in_progress" },
  { item: "Full core banking system (CBS) migration plan", status: "not_started" },
];

function randomBetween(min, max) {
  return Math.round(min + Math.random() * (max - min));
}

function posture(req, res) {
  const failedLoginsToday = randomBetween(120, 480);
  const anomalousLoginAlerts = randomBetween(3, 14);
  const blockedIpRanges = randomBetween(8, 40);
  const patchComplianceRate = randomBetween(88, 99);

  const loginTrend = Array.from({ length: 7 }).map((_, i) => ({
    day: `D-${6 - i}`,
    failedLogins: randomBetween(80, 500),
    anomalous: randomBetween(1, 16),
  }));

  res.json({
    failedLoginsToday,
    anomalousLoginAlerts,
    blockedIpRanges,
    patchComplianceRate,
    loginTrend,
    pqcReadiness: PQC_CHECKLIST,
  });
}

module.exports = { posture };
