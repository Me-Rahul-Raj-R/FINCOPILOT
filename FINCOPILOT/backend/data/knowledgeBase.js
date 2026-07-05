/**
 * Knowledge base for FinCopilot's RAG assistant.
 *
 * Each entry is a short, self-contained chunk: broad enough to be useful,
 * narrow enough that retrieval can pick out the right one. Entries fall
 * into two families:
 *   - "industry"  - general banking-sector problems (why they're hard,
 *                   not just what they are), used to answer open
 *                   knowledge questions.
 *   - "module"    - facts about what FinCopilot itself does, used to
 *                   answer "how does X work in this app" questions.
 *
 * All wording here is original - written for this knowledge base rather
 * than copied from any source - which also keeps retrieval honest: the
 * assistant paraphrases its own notes, it doesn't quote anyone.
 */

const KNOWLEDGE_BASE = [
  // ---------------- Industry: from the FinCopilot problem brief ----------------
  {
    id: "npa-bad-loans",
    tag: "industry",
    title: "Rising NPAs & bad loans",
    text: "When borrowers default, banks' capital base erodes, which restricts further lending and slows credit growth - public sector banks feel this hardest. AI-driven credit scoring that looks beyond a single bureau number, combined with faster recovery routes like the Insolvency and Bankruptcy Code, helps banks catch risk earlier and resolve bad loans faster.",
  },
  {
    id: "mule-accounts",
    tag: "industry",
    title: "Digital fraud & mule accounts",
    text: "The surge in UPI and IMPS volume has come with a surge in mule accounts - accounts opened specifically to receive and instantly forward stolen funds. Real-time transaction monitoring that looks at velocity and fan-out (how many distinct accounts money moves through in a short window) is far more effective than static rule lists at catching this pattern early.",
  },
  {
    id: "cyber-vulnerabilities",
    tag: "industry",
    title: "Cybersecurity & data privacy risk",
    text: "As banks shift core operations to mobile and cloud platforms, their attack surface grows. Zero-trust architectures, routine penetration testing, and continuous monitoring of login anomalies are the standard mitigations, though no bank can claim to be 100% secure against a determined, well-funded attacker.",
  },
  {
    id: "fintech-competition",
    tag: "industry",
    title: "Competition from fintechs & neobanks",
    text: "Fintechs win customers by shipping faster and personalizing more than legacy banks can. Rather than rebuilding everything in-house, many banks adopt Open Banking - exposing their own data and services through APIs so fintech partners can build on top of existing infrastructure instead of replacing it.",
  },

  // ---------------- Industry: from the "unsolved frontier problems" brief ----------------
  {
    id: "deepfake-kyc",
    tag: "industry",
    title: "AI deepfake video/audio KYC fraud",
    text: "Cheap, realistic AI-generated video and cloned voices can defeat older liveness checks like 'blink' or 'read this number' prompts, letting fraudsters open accounts without a human ever appearing on camera. No single check fully solves this yet; the current best practice is layering a randomized challenge with document and device-integrity signals so an attacker has to beat several independent checks simultaneously.",
  },
  {
    id: "quantum-threat",
    tag: "industry",
    title: "Quantum computing threat to encryption (\"Q-Day\")",
    text: "RSA and ECC, the encryption underpinning most banking systems, are expected to eventually fall to a sufficiently powerful quantum computer. Attackers are already running 'harvest now, decrypt later' campaigns - stealing encrypted data today to crack once that hardware exists - which is why banks are starting to inventory systems and pilot NIST-standardized post-quantum algorithms now, years before the threat fully materializes.",
  },
  {
    id: "real-time-scam-settlement",
    tag: "industry",
    title: "Real-time scam settlement / velocity of money",
    text: "UPI and IMPS were built for speed - transactions settle in seconds and can't be pulled back once they leave the bank. Scammers exploit this by layering stolen funds across many mule accounts within a minute, so by the time a victim reports it, the money is already withdrawn as cash or converted to crypto. The unsolved trade-off is freezing suspicious transfers mid-flight without delaying or wrongly blocking the millions of genuine transfers happening at the same time.",
  },
  {
    id: "climate-risk-lending",
    tag: "industry",
    title: "Climate risk in long-term lending",
    text: "A 20-year infrastructure or agricultural loan carries decades of exposure to floods, droughts, and shifting monsoon patterns, but banks lack standardized data to price that risk. Regulators like the RBI have issued draft disclosure frameworks, but without consistent hazard data across regions, most long-tenure climate risk is still priced by judgment rather than a model.",
  },

  // ---------------- Industry: from the "12 unsolved global banking problems" brief ----------------
  {
    id: "legacy-it",
    tag: "industry",
    title: "Legacy IT infrastructure",
    text: "Many large banks still run core systems written in COBOL decades ago. Replacing them is treated as too risky to attempt outright, since a botched migration can take transaction processing offline - so most banks instead wrap legacy cores with modern APIs rather than replacing them.",
  },
  {
    id: "cross-border-payments",
    tag: "industry",
    title: "Slow & costly cross-border payments",
    text: "International transfers through correspondent banking networks like SWIFT can take days and carry high fees, mainly because regulatory frameworks, time zones, and currency clearing systems differ across countries. Fintechs have only partially bypassed this friction by pre-funding local accounts in each corridor rather than solving the underlying settlement problem.",
  },
  {
    id: "financial-exclusion",
    tag: "industry",
    title: "Financial exclusion / the unbanked",
    text: "Roughly 1.4 billion adults globally have no bank account, largely because traditional banks find it unprofitable to build physical branches in low-income or remote areas, and applicants there often lack the credit history banks rely on. Financial inclusion efforts - mobile-first banking and alternative-data credit scoring using utility bills or cash-flow patterns - are the main tools chipping away at this gap.",
  },
  {
    id: "money-laundering",
    tag: "industry",
    title: "Money laundering & financial crime",
    text: "Billions of dollars in illicit funds move through the banking system each year, and most automated AML systems generate so many false positives that genuinely suspicious activity gets buried in noise. Criminal networks also adapt their methods faster than compliance technology updates. FinCopilot's Fraud Shield includes a basic structuring (smurfing) detector as a worked example of one AML typology, though a real AML program covers many more.",
  },
  {
    id: "systemic-risk",
    tag: "industry",
    title: "\"Too big to fail\" & systemic risk",
    text: "Global financial markets are interconnected enough that the failure of one major institution - as seen with Silicon Valley Bank and Credit Suisse - can cascade quickly into a wider crisis. Post-2008 rules like Basel III raised capital requirements, but didn't remove the underlying interconnectedness that makes contagion possible.",
  },
  {
    id: "credit-score-reliance",
    tag: "industry",
    title: "Over-reliance on traditional credit scores",
    text: "Lending algorithms built around historical credit scores systematically penalize young people, immigrants, and gig-economy workers who simply haven't built a long credit history yet - not because they're actually high risk. Building alternative-data risk models that satisfy regulators is technically possible but standardizing it across a bank's audit and compliance processes has been slow; FinCopilot's Credit Risk Engine includes a thin-file path that scores applicants on utility-payment consistency and cash-flow stability instead of bureau history, as a worked example of this approach.",
  },
  {
    id: "synthetic-identity-fraud",
    tag: "industry",
    title: "Identity theft & synthetic fraud",
    text: "Synthetic identity fraud blends real stolen data with fabricated details to create a person who doesn't actually exist, then uses that identity to open accounts and build credit before draining it. Standard KYC checks are built to confirm a named person exists, not to detect that a plausible-looking identity was pieced together from fragments across different systems - FinCopilot's KYC Vault demonstrates one mitigation: checking whether a phone number or device ID has already been used under a different name elsewhere on the platform.",
  },
  {
    id: "data-silos",
    tag: "industry",
    title: "Lack of interoperability / data silos",
    text: "Customer financial data mostly stays locked inside the institution that collected it, which blocks the kind of seamless cross-bank, cross-app experience Open Banking promises. Adoption has been slow because banks largely treat their customer data as a competitive moat rather than a shared utility.",
  },
  {
    id: "operational-costs",
    tag: "industry",
    title: "High operational costs & low efficiency",
    text: "A large share of bank revenue still goes toward manual compliance checks, paperwork, and maintaining physical branch networks. Full end-to-end automation is hard to reach because regulations differ by jurisdiction and often require a human sign-off step by design.",
  },
  {
    id: "de-risking",
    tag: "industry",
    title: "De-risking & regulatory chilling effects",
    text: "To avoid the risk of a large compliance fine, global banks sometimes cut ties entirely with whole sectors or regions - remittance companies and small island nations are common examples - rather than serve them under tighter monitoring. The math is simple from the bank's side: the downside of one compliance miss usually outweighs the profit from serving a thin-margin market.",
  },

  // ---------------- FinCopilot module facts ----------------
  {
    id: "module-credit-risk",
    tag: "module",
    title: "FinCopilot · Credit Risk Engine (CR-01)",
    text: "CR-01 has two scoring paths. Applicants with bureau history get a logistic regression model (trained on synthetic data) scoring debt-to-income, utilization, payment history, loan-to-value, and tenure. Applicants with no bureau history ('thin file') can instead be scored on alternative data - utility-payment consistency and cash-flow stability - a transparent weighted model built specifically so financial exclusion isn't just explained, it's partly addressed in the product itself.",
  },
  {
    id: "module-fraud-shield",
    tag: "module",
    title: "FinCopilot · Fraud Shield (FR-02)",
    text: "FR-02 scores each transaction against the sender's own recent history using four signals: an amount z-score, velocity (transfers per minute), fan-out (distinct beneficiaries in 10 minutes - mule layering), and structuring (many transfers individually kept under a reporting threshold that sum to well over it in a day - the classic AML 'smurfing' typology, distinct from fan-out). It outputs ALLOW, STEP_UP_AUTH, HOLD_FOR_REVIEW, or BLOCK.",
  },
  {
    id: "module-kyc-vault",
    tag: "module",
    title: "FinCopilot · KYC Vault (KY-03)",
    text: "KY-03 simulates a layered onboarding decision: document capture, a randomized liveness challenge code, a device-integrity flag, and a synthetic-identity check that looks for the same phone number or device ID being reused under a different applicant name across every applicant on the platform - a real linkage technique, since synthetic identities are built by recombining real fragments under a new name. No single signal alone can pass an applicant. The liveness portion itself is a workflow/architecture demo, not a certified biometric product.",
  },
  {
    id: "module-climate-ledger",
    tag: "module",
    title: "FinCopilot · Climate Ledger (CL-04)",
    text: "CL-04 multiplies an industry climate-exposure index by a regional physical-hazard index by a loan-tenure amplifier to produce a climate-adjusted risk score for long-term lending, plus an underwriting recommendation (standard terms, a risk premium, or mandatory insurance covenants).",
  },
  {
    id: "module-cyber-watch",
    tag: "module",
    title: "FinCopilot · Cyber Watch (SE-05)",
    text: "SE-05 shows a security-posture snapshot (failed logins, anomalous-login alerts, patch compliance) and a post-quantum-cryptography migration checklist, tracking how ready the (simulated) bank is to move off RSA/ECC for long-lived encrypted data.",
  },
  {
    id: "module-pay",
    tag: "module",
    title: "FinCopilot · Pay (PY-07)",
    text: "PY-07 is FinCopilot's GPay/PhonePe-style wallet: send money to contacts, pay bills, and view transaction history. Every P2P send is routed live through the FR-02 Fraud Shield engine before funds move, so a risky transfer can require step-up confirmation or be blocked - this is the same fraud model used elsewhere in the app, not a separate mock.",
  },
  {
    id: "module-auth-roles",
    tag: "module",
    title: "FinCopilot · accounts & roles",
    text: "Every FinCopilot account is a 'user' by default and gets its own wallet on signup. Admin accounts are never created through public signup - they're provisioned with `npm run seed:admin` using credentials from the backend's .env file - and admins can see data across every user plus promote or demote other accounts from the Admin panel.",
  },
];

module.exports = { KNOWLEDGE_BASE };
