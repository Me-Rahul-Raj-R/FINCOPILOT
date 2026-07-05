import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert, UserCheck, Wind, Cpu, Globe,
  Activity, ArrowRight, Settings, CheckCircle2, AlertTriangle, AlertCircle
} from "lucide-react";
import Card from "../components/Card.jsx";
import Badge from "../components/Badge.jsx";

const TABS = [
  { id: "fraud", label: "Mule & Fraud Simulator", icon: ShieldAlert },
  { id: "credit", label: "Alt-Data Scoring", icon: UserCheck },
  { id: "climate", label: "Climate Risk Underwriting", icon: Wind },
  { id: "quantum", label: "Quantum Safe Migration", icon: Cpu },
  { id: "border", label: "Cross-Border Settlement", icon: Globe }
];

export default function SolverHub() {
  const [activeTab, setActiveTab] = useState("fraud");

  // Tab 1: Fraud simulator state
  const [fraudAmt, setFraudAmt] = useState(15000);
  const [fraudVelocity, setFraudVelocity] = useState(2);
  const [fraudBeneficiaries, setFraudBeneficiaries] = useState(1);
  const [fraudReportingThreshold, setFraudReportingThreshold] = useState(50000);
  const [fraudTxnSize, setFraudTxnSize] = useState(48000); // for smurfing
  const [fraudTxnCount, setFraudTxnCount] = useState(3); // for smurfing

  // Tab 2: Credit scoring simulator state
  const [creditMode, setCreditMode] = useState("bureau");
  const [income, setIncome] = useState(50000);
  const [emi, setEmi] = useState(15000);
  const [utilization, setUtilization] = useState(65);
  const [latePayments, setLatePayments] = useState(2);
  const [utilityConsistency, setUtilityConsistency] = useState(95);
  const [cashFlowStability, setCashFlowStability] = useState(88);
  const [altDataMonths, setAltDataMonths] = useState(12);

  // Tab 3: Climate Risk state
  const [industry, setIndustry] = useState("Agriculture");
  const [region, setRegion] = useState("Coastal Zone");
  const [tenure, setTenure] = useState(15);

  // Tab 4: Quantum Migration state
  const [migrationStep, setMigrationStep] = useState(0);
  const [migrating, setMigrating] = useState(false);

  // Tab 5: Cross Border state
  const [borderChannel, setBorderChannel] = useState("swift");

  // --- Calculations ---

  // 1. Fraud Calculation
  const runFraudEvaluation = () => {
    let score = 10;
    const flags = [];

    // Amount z-score proxy
    if (fraudAmt > 80000) {
      score += 45;
      flags.push("Txn Amount Z-Score Outlier (3.2x deviation)");
    } else if (fraudAmt > 35000) {
      score += 20;
      flags.push("Txn Amount Z-Score Deviation (1.8x deviation)");
    }

    // Velocity proxy
    if (fraudVelocity > 4) {
      score += 40;
      flags.push(`Extreme Transaction Velocity (${fraudVelocity} txns/min)`);
    } else if (fraudVelocity > 2) {
      score += 20;
      flags.push(`High Transaction Velocity (${fraudVelocity} txns/min)`);
    }

    // Beneficiary fan-out proxy (Mule Accounts pattern)
    if (fraudBeneficiaries > 4) {
      score += 50;
      flags.push(`Mule Layering Indicator: Extreme Fan-Out (${fraudBeneficiaries} distinct accounts)`);
    } else if (fraudBeneficiaries > 2) {
      score += 25;
      flags.push(`Suspicious Fan-Out Activity (${fraudBeneficiaries} accounts in 10m)`);
    }

    // Structuring / Smurfing proxy (multiple transactions kept just under Reporting Threshold)
    const totalStructuredAmount = fraudTxnSize * fraudTxnCount;
    if (fraudTxnSize < fraudReportingThreshold && fraudTxnSize > (fraudReportingThreshold * 0.85) && fraudTxnCount > 1) {
      score += 35;
      flags.push(`AML Structuring Detection: ${fraudTxnCount} txns of ₹${fraudTxnSize} near ₹${fraudReportingThreshold} limit`);
    }

    score = Math.min(100, score);
    let decision = "ALLOW";
    if (score >= 70) decision = "BLOCK";
    else if (score >= 45) decision = "STEP_UP_AUTH";
    else if (score >= 25) decision = "HOLD_FOR_REVIEW";

    return { score, decision, flags, totalStructuredAmount };
  };
  const fraudResults = runFraudEvaluation();

  // 2. Credit Score Calculation
  const runCreditEvaluation = () => {
    if (creditMode === "bureau") {
      // standard scoring
      const dti = (emi / income) * 100;
      let score = 750;
      score -= dti > 45 ? 120 : dti > 30 ? 50 : 0;
      score -= utilization > 50 ? 100 : utilization > 30 ? 40 : 0;
      score -= latePayments * 45;
      score = Math.max(300, Math.min(900, score));
      const decision = score >= 680 ? "APPROVE" : "REJECT";
      return { score, decision, reason: score >= 680 ? "Healthy credit file" : "Insufficient credit history or high debt ratios" };
    } else {
      // alt-data scoring
      let score = 500;
      score += (utilityConsistency - 70) * 8; // consistency scales up
      score += (cashFlowStability - 50) * 4;
      score += Math.min(100, altDataMonths * 8);
      score = Math.max(300, Math.min(900, Math.round(score)));
      const decision = score >= 660 ? "APPROVE" : "REJECT";
      return { score, decision, reason: score >= 660 ? "Strong alternative ledger repayment patterns" : "Insufficient alternative data metrics" };
    }
  };
  const creditResults = runCreditEvaluation();

  // 3. Climate risk calculations
  const runClimateEvaluation = () => {
    const industryExposure = { Agriculture: 9, Tourism: 7, Infrastructure: 8, Retail: 2, Energy: 8 };
    const regionalHazard = { "Coastal Zone": 9, "Flood Plain": 8, "Drought Risk Zone": 7, "Earthquake Belt": 6, "Stable Inland": 2 };
    
    const exp = industryExposure[industry] || 5;
    const haz = regionalHazard[region] || 5;
    const tenureAmplifier = tenure > 15 ? 1.5 : tenure > 5 ? 1.2 : 1.0;
    
    const riskScore = Math.min(100, Math.round(exp * haz * tenureAmplifier));
    let rating = "Low";
    let premium = "0.00%";
    let covenant = "Standard Terms";
    
    if (riskScore >= 70) {
      rating = "High";
      premium = "+2.25% p.a.";
      covenant = "Mandatory physical asset insurance & flood barriers installation";
    } else if (riskScore >= 40) {
      rating = "Medium";
      premium = "+0.75% p.a.";
      covenant = "Annual physical hazard resiliency review";
    }
    
    return { riskScore, rating, premium, covenant };
  };
  const climateResults = runClimateEvaluation();

  // 4. Quantum simulation steps
  const startQuantumSafeMigration = () => {
    setMigrating(true);
    setMigrationStep(1);
    setTimeout(() => {
      setMigrationStep(2);
      setTimeout(() => {
        setMigrationStep(3);
        setTimeout(() => {
          setMigrationStep(4);
          setMigrating(false);
        }, 1500);
      }, 1500);
    }, 1500);
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
          Banking Problem Solver Workspace
        </h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: 700 }}>
          Interactive sandboxes demonstrating cryptographic, climate-aware, machine learning, and ledger-based solutions for 12 core global banking problems.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid var(--border-soft)",
        paddingBottom: 8, overflowX: "auto"
      }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
                border: "none", borderRadius: "var(--r-sm)",
                background: active ? "var(--bg-elevated)" : "transparent",
                borderBottom: active ? "2px solid var(--gold)" : "none",
                color: active ? "var(--gold)" : "var(--text-secondary)",
                cursor: "pointer", fontSize: 13, fontWeight: 500,
                whiteSpace: "nowrap", transition: "all 0.2s"
              }}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Workspace Containers */}
      <div style={{ minHeight: 450 }}>
        {activeTab === "fraud" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-2">
            <Card title="Fraud Shield Sandbox" subtitle="Adjust parameters to simulate live transactions passing through FR-02">
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label className="input-label" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Transaction Amount (INR)</span>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--gold)" }}>₹{fraudAmt.toLocaleString()}</span>
                  </label>
                  <input type="range" min="1000" max="150000" step="1000" value={fraudAmt} onChange={(e) => setFraudAmt(Number(e.target.value))} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)" }}>
                    <span>₹1,000</span>
                    <span>₹150,000</span>
                  </div>
                </div>

                <div>
                  <label className="input-label" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Transaction Velocity (per minute)</span>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--gold)" }}>{fraudVelocity} txns/min</span>
                  </label>
                  <input type="range" min="1" max="10" step="1" value={fraudVelocity} onChange={(e) => setFraudVelocity(Number(e.target.value))} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)" }}>
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>

                <div>
                  <label className="input-label" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Beneficiary Fan-Out (Distinct recipient accounts in 10m)</span>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--gold)" }}>{fraudBeneficiaries} accounts</span>
                  </label>
                  <input type="range" min="1" max="8" step="1" value={fraudBeneficiaries} onChange={(e) => setFraudBeneficiaries(Number(e.target.value))} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)" }}>
                    <span>1 (Standard)</span>
                    <span>8 (Severe Layering)</span>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12 }}>
                    Structuring &amp; Smurfing Simulator (AML evasion pattern)
                  </div>
                  <div className="grid grid-2" style={{ gap: 10 }}>
                    <div>
                      <label className="input-label">Mock Threshold Limit</label>
                      <input type="number" className="text-input" value={fraudReportingThreshold} readOnly style={{ opacity: 0.6 }} />
                    </div>
                    <div>
                      <label className="input-label">Repetitive Payment Size</label>
                      <input type="number" className="text-input" value={fraudTxnSize} onChange={(e) => setFraudTxnSize(Number(e.target.value))} />
                    </div>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <label className="input-label" style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Repetitive Hops count (within 24 hours)</span>
                      <span style={{ fontFamily: "var(--font-mono)", color: "var(--gold)" }}>{fraudTxnCount} times</span>
                    </label>
                    <input type="range" min="1" max="5" step="1" value={fraudTxnCount} onChange={(e) => setFraudTxnCount(Number(e.target.value))} />
                  </div>
                </div>
              </div>
            </Card>

            <Card title="FR-02 Fraud Shield Output" subtitle="Decision output generated live by the multi-signal algorithm">
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: 12, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 6 }}>
                    Fraud Risk Score
                  </div>
                  <div style={{ fontSize: 64, fontWeight: 700, fontFamily: "var(--font-display)", color: fraudResults.score >= 70 ? "var(--coral)" : fraudResults.score >= 45 ? "var(--amber)" : "var(--teal)" }}>
                    {fraudResults.score}
                    <span style={{ fontSize: 20, color: "var(--text-muted)" }}>/100</span>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <Badge tone={fraudResults.decision}>{fraudResults.decision.replace(/_/g, " ")}</Badge>
                  </div>
                </div>

                <div style={{ background: "var(--bg-overlay)", border: "1px solid var(--border-soft)", borderRadius: "var(--r-md)", padding: 16, flex: 1 }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <Activity size={12} /> Live Detection Logs
                  </div>

                  {fraudResults.flags.length === 0 ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--teal)" }}>
                      <CheckCircle2 size={14} /> Clear transaction profile. Zero suspicious signals flagged.
                    </div>
                  ) : (
                    <ul style={{ paddingLeft: 16, margin: 0, fontSize: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                      {fraudResults.flags.map((flag, idx) => (
                        <li key={idx} style={{ color: "var(--text-primary)" }}>
                          <span style={{ color: "var(--coral)", fontWeight: 500 }}>🚨 Flagged:</span> {flag}
                        </li>
                      ))}
                    </ul>
                  )}

                  {fraudResults.totalStructuredAmount > 0 && fraudTxnCount > 1 && (
                    <div style={{ marginTop: 14, padding: "8px 12px", background: "rgba(0,0,0,0.2)", borderRadius: 6, fontSize: 11, border: "1px solid var(--border-soft)" }}>
                      <span style={{ color: "var(--text-muted)" }}>Structuring Aggregate Total:</span> ₹{fraudResults.totalStructuredAmount.toLocaleString()} / 24h
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === "credit" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-2">
            <Card title="Credit Scoring Mode Configuration" subtitle="Toggle models to compare standard credit scoring against inclusionary scoring">
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", gap: 10, background: "var(--bg-overlay)", padding: 6, borderRadius: "var(--r-sm)", border: "1px solid var(--border-soft)" }}>
                  <button
                    onClick={() => setCreditMode("bureau")}
                    style={{
                      flex: 1, padding: "8px 12px", border: "none", borderRadius: 6,
                      background: creditMode === "bureau" ? "var(--bg-surface)" : "transparent",
                      color: creditMode === "bureau" ? "var(--gold)" : "var(--text-secondary)",
                      cursor: "pointer", fontSize: 12.5, fontWeight: creditMode === "bureau" ? 600 : 400
                    }}
                  >
                    Traditional Bureau Mode
                  </button>
                  <button
                    onClick={() => setCreditMode("alt")}
                    style={{
                      flex: 1, padding: "8px 12px", border: "none", borderRadius: 6,
                      background: creditMode === "alt" ? "var(--bg-surface)" : "transparent",
                      color: creditMode === "alt" ? "var(--teal)" : "var(--text-secondary)",
                      cursor: "pointer", fontSize: 12.5, fontWeight: creditMode === "alt" ? 600 : 400
                    }}
                  >
                    Alternative Data Mode (Thin File)
                  </button>
                </div>

                {creditMode === "bureau" ? (
                  <>
                    <div>
                      <label className="input-label" style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Monthly Income (INR)</span>
                        <span>₹{income.toLocaleString()}</span>
                      </label>
                      <input type="range" min="15000" max="150000" step="5000" value={income} onChange={(e) => setIncome(Number(e.target.value))} />
                    </div>

                    <div>
                      <label className="input-label" style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Monthly EMI Outgoings</span>
                        <span>₹{emi.toLocaleString()}</span>
                      </label>
                      <input type="range" min="0" max="60000" step="2000" value={emi} onChange={(e) => setEmi(Number(e.target.value))} />
                    </div>

                    <div>
                      <label className="input-label" style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Credit Limit Utilization</span>
                        <span>{utilization}%</span>
                      </label>
                      <input type="range" min="0" max="100" step="5" value={utilization} onChange={(e) => setUtilization(Number(e.target.value))} />
                    </div>

                    <div>
                      <label className="input-label" style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Late Payments (last 24m)</span>
                        <span>{latePayments} times</span>
                      </label>
                      <input type="range" min="0" max="8" step="1" value={latePayments} onChange={(e) => setLatePayments(Number(e.target.value))} />
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ padding: "10px 12px", background: "var(--teal-glow)", border: "1px solid var(--teal-border)", borderRadius: "var(--r-sm)", fontSize: 12, color: "var(--teal)" }}>
                      💡 This scoring path targets users without a credit score history (thin-file applicants) by analyzing utility consistency, cash-flow reliability, and mobile ledger longevity.
                    </div>

                    <div>
                      <label className="input-label" style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Utility &amp; Rent Payment Consistency</span>
                        <span>{utilityConsistency}% on-time</span>
                      </label>
                      <input type="range" min="60" max="100" step="1" value={utilityConsistency} onChange={(e) => setUtilityConsistency(Number(e.target.value))} />
                    </div>

                    <div>
                      <label className="input-label" style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Cash Flow Stability Index</span>
                        <span>{cashFlowStability}/100</span>
                      </label>
                      <input type="range" min="30" max="100" step="1" value={cashFlowStability} onChange={(e) => setCashFlowStability(Number(e.target.value))} />
                    </div>

                    <div>
                      <label className="input-label" style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Alternative Ledger History Longevity</span>
                        <span>{altDataMonths} months</span>
                      </label>
                      <input type="range" min="2" max="24" step="1" value={altDataMonths} onChange={(e) => setAltDataMonths(Number(e.target.value))} />
                    </div>
                  </>
                )}
              </div>
            </Card>

            <Card title="Risk Engine Output" subtitle="Calculated risk score & underwriting classification">
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", textAlign: "center" }}>
                <div style={{ padding: "30px 0" }}>
                  <div style={{ fontSize: 12, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 6 }}>
                    Computed Credit Score
                  </div>
                  <div style={{ fontSize: 72, fontWeight: 700, fontFamily: "var(--font-display)", color: creditResults.decision === "APPROVE" ? "var(--teal)" : "var(--coral)" }}>
                    {creditResults.score}
                    <span style={{ fontSize: 18, color: "var(--text-muted)", fontWeight: 400 }}> / 900</span>
                  </div>

                  <div style={{ marginTop: 18 }}>
                    <Badge tone={creditResults.decision}>{creditResults.decision}</Badge>
                  </div>
                </div>

                <div style={{ background: "var(--bg-overlay)", border: "1px solid var(--border-soft)", borderRadius: "var(--r-md)", padding: 18, textAlign: "left" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    {creditResults.decision === "APPROVE" ? (
                      <CheckCircle2 size={18} color="var(--teal)" style={{ flexShrink: 0, marginTop: 2 }} />
                    ) : (
                      <AlertCircle size={18} color="var(--coral)" style={{ flexShrink: 0, marginTop: 2 }} />
                    )}
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>Underwriting Decision Reasoning</div>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
                        {creditResults.reason}. The user passes the score safety limit of {creditMode === "bureau" ? "680" : "660"}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === "climate" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-2">
            <Card title="Climate Ledger Parameters" subtitle="Specify geography and industry to determine climate loan risk premium">
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label className="input-label">Borrower Industry sector</label>
                  <select className="text-input" value={industry} onChange={(e) => setIndustry(e.target.value)} style={{ width: "100%", background: "var(--bg-overlay)" }}>
                    <option value="Agriculture">Agriculture (Highly Vulnerable to Drought/Flood)</option>
                    <option value="Energy">Energy (Transition Risk &amp; Emissions Target Vulnerability)</option>
                    <option value="Infrastructure">Infrastructure (Physical asset damage exposure)</option>
                    <option value="Tourism">Tourism (Climate shifting season exposure)</option>
                    <option value="Retail">Retail &amp; Tech (Low relative physical risk)</option>
                  </select>
                </div>

                <div>
                  <label className="input-label">Asset Geographical Region</label>
                  <select className="text-input" value={region} onChange={(e) => setRegion(e.target.value)} style={{ width: "100%", background: "var(--bg-overlay)" }}>
                    <option value="Coastal Zone">Coastal Zone (Extreme Sea-level &amp; Cyclone Hazard)</option>
                    <option value="Flood Plain">Flood Plain (High Monsoon River Basin Flooding)</option>
                    <option value="Drought Risk Zone">Drought Risk Zone (Water stress &amp; heat waves)</option>
                    <option value="Earthquake Belt">Earthquake Belt (Seismic physical damage danger)</option>
                    <option value="Stable Inland">Stable Inland (Low natural physical risk factors)</option>
                  </select>
                </div>

                <div>
                  <label className="input-label" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Loan Underwriting Tenure</span>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--gold)" }}>{tenure} Years</span>
                  </label>
                  <input type="range" min="1" max="25" step="1" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)" }}>
                    <span>Short-term (1y)</span>
                    <span>Long-term (25y)</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Climate-Adjusted Score output" subtitle="Calculated physical hazard exposure ledger details">
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                <div style={{ textAlign: "center", padding: "18px 0" }}>
                  <div style={{ fontSize: 12, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 6 }}>
                    Climate Risk Score
                  </div>
                  <div style={{ fontSize: 60, fontWeight: 700, fontFamily: "var(--font-display)", color: climateResults.rating === "High" ? "var(--coral)" : climateResults.rating === "Medium" ? "var(--amber)" : "var(--teal)" }}>
                    {climateResults.riskScore}
                    <span style={{ fontSize: 18, color: "var(--text-muted)", fontWeight: 400 }}> / 100</span>
                  </div>

                  <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 8 }}>
                    <Badge tone={climateResults.rating === "High" ? "REJECTED" : climateResults.rating === "Medium" ? "MANUAL_REVIEW" : "APPROVED"}>
                      {climateResults.rating} Risk
                    </Badge>
                    {climateResults.premium !== "0.00%" && (
                      <Badge tone="MANUAL_REVIEW">{climateResults.premium} Premium</Badge>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ background: "var(--bg-overlay)", border: "1px solid var(--border-soft)", borderRadius: "var(--r-md)", padding: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 4 }}>
                      Required Loan Covenants
                    </div>
                    <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--text-primary)" }}>
                      {climateResults.covenant}
                    </div>
                  </div>

                  <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4, padding: "0 4px" }}>
                    * The risk score aggregates the Industry Climate exposure index ({industry}) with geographical physical risk indices ({region}), amplified by a tenure factor of {tenure > 15 ? "1.5x (long duration)" : "1.0x"} to comply with regulatory ESG guidelines.
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === "quantum" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-2" style={{ marginBottom: 20 }}>
              <Card title="Quantum Vulnerability Index" subtitle="RSA/ECC encryption vulnerability on banking ledgers (Q-Day preparation)">
                <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(240,82,82,0.1)", border: "1px solid var(--coral-border)", borderRadius: "var(--r-sm)", padding: 12 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--coral)" }}>RSA-2048 / ECC-256 Ledger Keys</div>
                      <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>Vulnerable to Shor's algorithm decryption</div>
                    </div>
                    <span style={{ fontSize: 11, color: "var(--coral)", fontWeight: 700, textTransform: "uppercase" }}>High Risk</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(56,217,200,0.1)", border: "1px solid var(--teal-border)", borderRadius: "var(--r-sm)", padding: 12 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--teal)" }}>Kyber-768 &amp; ML-DSA Signature Keys</div>
                      <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>NIST Standardized Post-Quantum Cryptography</div>
                    </div>
                    <span style={{ fontSize: 11, color: "var(--teal)", fontWeight: 700, textTransform: "uppercase" }}>Quantum Secure</span>
                  </div>

                  <button
                    className="button"
                    disabled={migrating}
                    onClick={startQuantumSafeMigration}
                    style={{ alignSelf: "flex-start", marginTop: 10, background: "var(--gold)", color: "#000", fontWeight: 600 }}
                  >
                    {migrating ? "Executing Protocol..." : "Start PQC Key Migration Simulation"}
                  </button>
                </div>
              </Card>

              <Card title="Migration Simulation Console" subtitle="Visual sequence of cryptographic migration steps">
                <div style={{ display: "flex", flexDirection: "column", gap: 12, background: "#02050b", borderRadius: "var(--r-md)", border: "1px solid var(--border-soft)", padding: 16, minHeight: 200, fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--text-muted)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: migrationStep >= 1 ? "var(--teal)" : "var(--text-muted)" }}>
                    <span style={{ width: 16, height: 16, borderRadius: "50%", background: migrationStep >= 1 ? "var(--teal)" : "transparent", border: "1px solid var(--border-soft)", display: "flex", alignItems: "center", justify: "center", fontSize: 9 }}>1</span>
                    <span>Inventorying all RSA-2048/ECC private keys on transactions ledger</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: migrationStep >= 2 ? "var(--teal)" : "var(--text-muted)" }}>
                    <span style={{ width: 16, height: 16, borderRadius: "50%", background: migrationStep >= 2 ? "var(--teal)" : "transparent", border: "1px solid var(--border-soft)", display: "flex", alignItems: "center", justify: "center", fontSize: 9 }}>2</span>
                    <span>Generating Kyber-768 quantum-resistant symmetric seed exchanges</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: migrationStep >= 3 ? "var(--teal)" : "var(--text-muted)" }}>
                    <span style={{ width: 16, height: 16, borderRadius: "50%", background: migrationStep >= 3 ? "var(--teal)" : "transparent", border: "1px solid var(--border-soft)", display: "flex", alignItems: "center", justify: "center", fontSize: 9 }}>3</span>
                    <span>Upgrading authentication signatures to NIST ML-DSA algorithm specifications</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: migrationStep >= 4 ? "var(--teal)" : "var(--text-muted)" }}>
                    <span style={{ width: 16, height: 16, borderRadius: "50%", background: migrationStep >= 4 ? "var(--teal)" : "transparent", border: "1px solid var(--border-soft)", display: "flex", alignItems: "center", justify: "center", fontSize: 9 }}>4</span>
                    <span style={{ color: migrationStep >= 4 ? "var(--teal)" : "inherit" }}>All core wallets, accounts, and credentials migrated. Ledger safe.</span>
                  </div>

                  {migrationStep === 4 && (
                    <div style={{ marginTop: 14, padding: 8, border: "1px dashed var(--teal-border)", borderRadius: 6, color: "var(--teal)", textAlign: "center", background: "var(--teal-glow)" }}>
                      🏆 PQC Migration Completed Successfully!
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === "border" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card title="Cross-Border Payments Clearing" subtitle="Compare slow correspondent network pathways with CBDC / DLT ledgers">
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", gap: 10, background: "var(--bg-overlay)", padding: 6, borderRadius: "var(--r-sm)", border: "1px solid var(--border-soft)" }}>
                  <button
                    onClick={() => setBorderChannel("swift")}
                    style={{
                      flex: 1, padding: "8px 12px", border: "none", borderRadius: 6,
                      background: borderChannel === "swift" ? "var(--bg-surface)" : "transparent",
                      color: borderChannel === "swift" ? "var(--gold)" : "var(--text-secondary)",
                      cursor: "pointer", fontSize: 12.5, fontWeight: borderChannel === "swift" ? 600 : 400
                    }}
                  >
                    SWIFT Correspondent Banks (Standard)
                  </button>
                  <button
                    onClick={() => setBorderChannel("cbdc")}
                    style={{
                      flex: 1, padding: "8px 12px", border: "none", borderRadius: 6,
                      background: borderChannel === "cbdc" ? "var(--bg-surface)" : "transparent",
                      color: borderChannel === "cbdc" ? "var(--teal)" : "var(--text-secondary)",
                      cursor: "pointer", fontSize: 12.5, fontWeight: borderChannel === "cbdc" ? 600 : 400
                    }}
                  >
                    CBDC / Real-time Ledger (Target state)
                  </button>
                </div>

                {borderChannel === "swift" ? (
                  <div style={{ padding: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gold)", marginBottom: 12 }}>
                      Path: Origin Bank → Intermediary Core → Clearing Bank → Destination Bank
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative", paddingLeft: 20 }}>
                      {/* Timeline line */}
                      <div style={{ position: "absolute", left: 5, top: 10, bottom: 10, width: 1, background: "var(--gold-border)" }} />
                      
                      <div style={{ position: "relative" }}>
                        <div style={{ position: "absolute", left: -18, top: 4, width: 7, height: 7, borderRadius: "50%", background: "var(--gold)" }} />
                        <div style={{ fontSize: 12, fontWeight: 600 }}>Origin Bank (Initiation)</div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Compliance audit check, currency Conversion. Fee: $15. Duration: 4 hrs</div>
                      </div>

                      <div style={{ position: "relative" }}>
                        <div style={{ position: "absolute", left: -18, top: 4, width: 7, height: 7, borderRadius: "50%", background: "var(--gold)" }} />
                        <div style={{ fontSize: 12, fontWeight: 600 }}>Intermediary Centralized Hop (KYC &amp; AML Clearing)</div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Nostro/Vostro balance matching. Fee: $25. Duration: 12 hrs</div>
                      </div>

                      <div style={{ position: "relative" }}>
                        <div style={{ position: "absolute", left: -18, top: 4, width: 7, height: 7, borderRadius: "50%", background: "var(--gold)" }} />
                        <div style={{ fontSize: 12, fontWeight: 600 }}>Clearing House (Foreign settlement)</div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Timezone batch processing wait. Fee: $10. Duration: 8 hrs</div>
                      </div>

                      <div style={{ position: "relative" }}>
                        <div style={{ position: "absolute", left: -18, top: 4, width: 7, height: 7, borderRadius: "50%", background: "var(--gold)" }} />
                        <div style={{ fontSize: 12, fontWeight: 600 }}>Destination Bank (Crediting account)</div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Local credit verification and final settlement. Duration: 2 hrs</div>
                      </div>
                    </div>

                    <div style={{ marginTop: 20, padding: 12, background: "rgba(232,184,75,0.1)", borderRadius: "var(--r-sm)", border: "1px solid var(--gold-border)", display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <div>Total Fees: <strong style={{ color: "var(--gold)" }}>$50 USD</strong></div>
                      <div>Total Duration: <strong style={{ color: "var(--gold)" }}>26 Hours</strong></div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--teal)", marginBottom: 12 }}>
                      Path: Origin Wallet ──(Smart Contract Settlement)──&gt; Destination Wallet
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative", paddingLeft: 20 }}>
                      <div style={{ position: "absolute", left: 5, top: 10, bottom: 10, width: 1, background: "var(--teal-border)" }} />
                      
                      <div style={{ position: "relative" }}>
                        <div style={{ position: "absolute", left: -18, top: 4, width: 7, height: 7, borderRadius: "50%", background: "var(--teal)" }} />
                        <div style={{ fontSize: 12, fontWeight: 600 }}>Initiation (Origin)</div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Tokenized liability matching via Central Bank digital ledger</div>
                      </div>

                      <div style={{ position: "relative" }}>
                        <div style={{ position: "absolute", left: -18, top: 4, width: 7, height: 7, borderRadius: "50%", background: "var(--teal)" }} />
                        <div style={{ fontSize: 12, fontWeight: 600 }}>Consensus and Atomic Settlement</div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Simultaneous payment vs payment (PvP) atomic ledger update</div>
                      </div>
                    </div>

                    <div style={{ marginTop: 20, padding: 12, background: "var(--teal-glow)", borderRadius: "var(--r-sm)", border: "1px solid var(--teal-border)", display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <div>Total Fees: <strong style={{ color: "var(--teal)" }}>$0.02 USD</strong></div>
                      <div>Total Duration: <strong style={{ color: "var(--teal)" }}>0.8 Seconds</strong></div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
