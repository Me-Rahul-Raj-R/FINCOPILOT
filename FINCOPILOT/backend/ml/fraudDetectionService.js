/**
 * Fraud / mule-account / AML detection.
 *
 * Combines four well-established, lightweight techniques rather than a
 * single black-box score, so the decision stays explainable:
 *
 *   1. Amount anomaly  - z-score of this transaction vs the sender's
 *      historical mean/stddev (classic statistical outlier detection).
 *   2. Velocity         - how many transactions the sender has fired in
 *      a short rolling window (mule accounts move money fast).
 *   3. Fan-out          - how many *distinct* beneficiaries the sender has
 *      paid in that same window (layering money across mule accounts).
 *   4. Structuring      - many transfers individually kept under a
 *      reporting threshold that sum to well over it in a day (the classic
 *      "smurfing" AML typology - staying invisible rather than spreading out).
 *
 * Combined with simple device/beneficiary-novelty flags, this produces a
 * 0-100 fraudRiskScore and a recommended action - the same shape as the
 * "circuit breaker" idea needed to interrupt real-time scam settlement
 * before funds fully clear.
 */

const STRUCTURING_REPORT_THRESHOLD = 200000; // ₹2,00,000 - a stand-in for a real CTR-style reporting threshold
const STRUCTURING_SUBTHRESHOLD_CAP = 50000; // individual transfers kept conspicuously below the threshold

function mean(arr) {
  return arr.reduce((s, v) => s + v, 0) / (arr.length || 1);
}

function stdDev(arr) {
  const m = mean(arr);
  const variance = mean(arr.map((v) => (v - m) ** 2));
  return Math.sqrt(variance) || 1;
}

function decisionFor(score) {
  if (score >= 75) return "BLOCK";
  if (score >= 50) return "HOLD_FOR_REVIEW";
  if (score >= 25) return "STEP_UP_AUTH";
  return "ALLOW";
}

/**
 * @param {object} txn - { senderAccount, receiverAccount, amount, channel, newDevice, newBeneficiary }
 * @param {Array}  history - sender's recent transactions, each { amount, receiverAccount, createdAt }
 */
function evaluateTransaction(txn, history = []) {
  const flags = [];
  let score = 0;

  // 1. Amount anomaly (z-score)
  const amounts = history.map((h) => h.amount);
  if (amounts.length >= 3) {
    const z = (txn.amount - mean(amounts)) / stdDev(amounts);
    if (z > 3) {
      score += 30;
      flags.push(`Amount is ${z.toFixed(1)}x sender's normal spread (z-score)`);
    } else if (z > 2) {
      score += 15;
      flags.push(`Amount unusually high vs sender history (z=${z.toFixed(1)})`);
    }
  } else if (txn.amount > 200000) {
    score += 10;
    flags.push("Large amount with no transaction history to compare against");
  }

  // 2. Velocity - transactions in the last 60 seconds
  const now = Date.now();
  const lastMinute = history.filter(
    (h) => now - new Date(h.createdAt).getTime() < 60 * 1000
  );
  if (lastMinute.length >= 5) {
    score += 30;
    flags.push(`${lastMinute.length} transactions from this account in <60s (velocity)`);
  } else if (lastMinute.length >= 3) {
    score += 15;
    flags.push(`${lastMinute.length} transactions from this account in <60s`);
  }

  // 3. Fan-out - distinct beneficiaries in the last 10 minutes (mule layering)
  const last10Min = history.filter(
    (h) => now - new Date(h.createdAt).getTime() < 10 * 60 * 1000
  );
  const distinctBeneficiaries = new Set(
    last10Min.map((h) => h.receiverAccount).concat(txn.receiverAccount)
  );
  if (distinctBeneficiaries.size >= 8) {
    score += 30;
    flags.push(
      `Funds fanned out to ${distinctBeneficiaries.size} distinct accounts in 10 min (mule layering pattern)`
    );
  } else if (distinctBeneficiaries.size >= 4) {
    score += 15;
    flags.push(`${distinctBeneficiaries.size} distinct beneficiaries in 10 min`);
  }

  // 4. Structuring / smurfing - an AML typology distinct from mule fan-out:
  // many transfers, each conspicuously under a reporting threshold, that
  // sum to something well over it within a day. Mule layering (#3 above)
  // is about *spreading money out*; structuring is about *staying invisible*
  // while moving a large total.
  const last24h = history.filter((h) => now - new Date(h.createdAt).getTime() < 24 * 60 * 60 * 1000);
  const subThresholdTxns = last24h.filter((h) => h.amount < STRUCTURING_SUBTHRESHOLD_CAP);
  const cumulative24h = subThresholdTxns.reduce((s, h) => s + h.amount, 0) + (txn.amount < STRUCTURING_SUBTHRESHOLD_CAP ? txn.amount : 0);
  if (txn.amount < STRUCTURING_SUBTHRESHOLD_CAP && subThresholdTxns.length >= 3 && cumulative24h >= STRUCTURING_REPORT_THRESHOLD) {
    score += 25;
    flags.push(
      `Possible structuring: ${subThresholdTxns.length + 1} transfers under ₹${STRUCTURING_SUBTHRESHOLD_CAP.toLocaleString("en-IN")} sum to ₹${cumulative24h.toLocaleString("en-IN")} in 24h (AML typology, not just a large single transfer)`
    );
  }

  // 5. Contextual flags
  if (txn.newDevice) {
    score += 10;
    flags.push("Initiated from a device not previously linked to this account");
  }
  if (txn.newBeneficiary) {
    score += 10;
    flags.push("First-time payment to this beneficiary");
  }

  score = Math.min(100, score);
  if (flags.length === 0) flags.push("No anomaly signals detected");

  return {
    fraudRiskScore: score,
    decision: decisionFor(score),
    flags,
  };
}

module.exports = { evaluateTransaction };
