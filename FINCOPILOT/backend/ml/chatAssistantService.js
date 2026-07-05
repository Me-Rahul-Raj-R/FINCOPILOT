/**
 * Lightweight intent-matching assistant for customer queries.
 *
 * This keeps FinCopilot's "AI Assistant" surface fully self-contained
 * (no external LLM key required to run the demo). Each intent is matched
 * by keyword overlap; the highest-scoring intent above a threshold wins.
 * Swap this module for a call to a hosted LLM API later without touching
 * any other part of the app - chatController.js only depends on
 * answer(message) below.
 */

const INTENTS = [
  {
    tag: "credit_score_meaning",
    keywords: ["credit score", "cibil", "risk score", "what does my score mean", "score mean"],
    response:
      "Your FinCopilot risk score runs 300-900, like a CIBIL score: higher means lower predicted default risk. Scores above 750 are typically 'Low risk', 650-750 is 'Medium', and below 650 is 'High'. You can generate one on the Credit Risk page.",
  },
  {
    tag: "loan_status",
    keywords: ["loan status", "loan application", "is my loan approved", "loan decision"],
    response:
      "I can't pull a live application from here in this demo, but on the Credit Risk page you can submit your figures and instantly see the model's decision (Approve / Approve with conditions / Refer to committee) along with the top factors driving it.",
  },
  {
    tag: "report_fraud",
    keywords: ["fraud", "scam", "hacked", "unauthorised", "unauthorized", "someone stole", "mule"],
    response:
      "If you suspect fraud on a real account, contact your bank's 24x7 fraud helpline or call 1930 (India's National Cyber Crime helpline) immediately - the faster a transaction is reported, the more likely the receiving bank can freeze it before the funds move again. The Fraud Shield page in this demo shows how such transactions get auto-flagged.",
  },
  {
    tag: "kyc_help",
    keywords: ["kyc", "verify identity", "onboarding", "video kyc", "liveness", "deepfake"],
    response:
      "FinCopilot's KYC Vault module demonstrates a layered onboarding flow: document capture, a randomized liveness challenge, and device-integrity checks - designed so a single spoofed signal isn't enough to pass. Try it on the KYC Vault page.",
  },
  {
    tag: "climate_risk",
    keywords: ["climate", "weather risk", "flood", "monsoon", "esg"],
    response:
      "The Climate Ledger page models how a borrower's industry and region affect long-term loan risk - useful for multi-year agricultural or infrastructure lending where physical climate hazards compound over the loan tenure.",
  },
  {
    tag: "cyber_security",
    keywords: ["cyber security", "cybersecurity", "data privacy", "encryption", "quantum"],
    response:
      "The Cyber Watch page shows a simplified security-posture dashboard: encryption status, recent anomalous-login signals, and a post-quantum-cryptography migration readiness checklist for long-lived encrypted data.",
  },
  {
    tag: "open_banking",
    keywords: ["fintech", "open banking", "api", "partner", "neobank"],
    response:
      "FinCopilot's backend is a REST API by design (Express + MongoDB) so it can sit behind an Open Banking layer and be consumed by fintech partners or embedded into existing banking apps without a rebuild.",
  },
  {
    tag: "greeting",
    keywords: ["hi", "hello", "hey", "good morning", "good evening"],
    response:
      "Hi! I'm the FinCopilot assistant. Ask me about credit scores, fraud alerts, KYC onboarding, climate risk on loans, or cyber security - or explore the modules in the sidebar.",
  },
];

const FALLBACK =
  "I'm a focused demo assistant for this project, so I only know about FinCopilot's modules: credit risk scoring, fraud/mule detection, KYC onboarding, climate risk, and cyber security. Try asking about one of those, or explore the sidebar.";

function scoreIntent(message, intent) {
  const lower = message.toLowerCase();
  return intent.keywords.reduce(
    (score, kw) => (lower.includes(kw) ? score + kw.split(" ").length : score),
    0
  );
}

function answer(message) {
  if (!message || !message.trim()) return FALLBACK;

  let best = null;
  let bestScore = 0;
  for (const intent of INTENTS) {
    const s = scoreIntent(message, intent);
    if (s > bestScore) {
      bestScore = s;
      best = intent;
    }
  }

  return best && bestScore > 0 ? best.response : FALLBACK;
}

module.exports = { answer };
