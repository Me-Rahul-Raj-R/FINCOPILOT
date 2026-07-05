import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, BarChart2, Users } from "lucide-react";
import Card from "../components/Card.jsx";
import Badge from "../components/Badge.jsx";
import TrustRadar from "../components/TrustRadar.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { api } from "../lib/api.js";
import { useToast } from "../lib/ToastContext.jsx";

const BUREAU_DEF = { applicantName:"", monthlyIncome:60000, monthlyEmiOutgo:18000, creditUtilizationPct:35, latePayments24m:0, loanToValuePct:70, yearsEmployed:3, existingNpaFlag:false, loanAmount:1000000 };
const THIN_DEF   = { applicantName:"", monthlyIncome:28000, loanAmount:150000, utilityPaymentConsistencyPct:85, cashFlowStabilityScore:72, monthsOfAltData:12 };
const RISK_COLOR = { Low:"var(--teal)", Medium:"var(--amber)", High:"var(--coral)" };

function Field({ label, type="number", value, onChange, placeholder, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children || <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />}
    </div>
  );
}

export default function CreditRisk() {
  const toast = useToast();
  const [mode, setMode] = useState("bureau");
  const [bureau, setBureau] = useState(BUREAU_DEF);
  const [thin, setThin] = useState(THIN_DEF);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState([]);

  const upB = (k, v) => setBureau(f => ({ ...f, [k]: v }));
  const upT = (k, v) => setThin(f => ({ ...f, [k]: v }));

  useEffect(() => { api.listCreditApplications().then(setRecent).catch(() => {}); }, []);

  async function onSubmit(e) {
    e.preventDefault(); setLoading(true);
    try {
      const payload = mode === "bureau"
        ? { ...bureau, monthlyIncome:+bureau.monthlyIncome, monthlyEmiOutgo:+bureau.monthlyEmiOutgo, creditUtilizationPct:+bureau.creditUtilizationPct, latePayments24m:+bureau.latePayments24m, loanToValuePct:+bureau.loanToValuePct, yearsEmployed:+bureau.yearsEmployed, loanAmount:+bureau.loanAmount, applicantName:bureau.applicantName||"Unnamed" }
        : { thinFile:true, ...thin, monthlyIncome:+thin.monthlyIncome, loanAmount:+thin.loanAmount, utilityPaymentConsistencyPct:+thin.utilityPaymentConsistencyPct, cashFlowStabilityScore:+thin.cashFlowStabilityScore, monthsOfAltData:+thin.monthsOfAltData, applicantName:thin.applicantName||"Unnamed" };
      const res = await api.scoreCredit(payload);
      setResult(res);
      toast.success(`${res.applicantName} scored ${res.riskScore} · ${res.riskCategory} risk`);
      api.listCreditApplications().then(setRecent).catch(() => {});
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }

  const gaugeVal = result ? ((result.riskScore - 300) / 600) * 100 : 0;
  const ac = result ? RISK_COLOR[result.riskCategory] : "var(--teal)";

  return (
    <div>
      <div className="page-head">
        <span className="page-eyebrow">CR-01 · Credit Risk Engine</span>
        <h1 className="page-title">Credit Risk <span className="gradient-text">Engine</span></h1>
        <p className="page-sub">Logistic-regression model for bureau applicants · Alternative-data path for thin-file / gig-economy borrowers addressing financial exclusion.</p>
      </div>

      <div className="two-col">
        {/* Form */}
        <Card>
          {/* Mode toggle */}
          <div style={{ display:"flex", gap:4, background:"var(--bg-base)", border:"1px solid var(--border-soft)", borderRadius:"var(--r-sm)", padding:3, marginBottom:20 }}>
            {[["bureau","Bureau Model"],["thinFile","Alternative Data (Thin-file)"]].map(([k,l]) => (
              <button key={k} type="button" onClick={() => { setMode(k); setResult(null); }}
                style={{ flex:1, padding:"9px 10px", borderRadius:"calc(var(--r-sm) - 2px)", border:"none", cursor:"pointer", fontSize:12.5, fontWeight:600, transition:"all var(--t-base) var(--ease)", background:mode===k?"var(--bg-elevated)":"transparent", color:mode===k?"var(--text-primary)":"var(--text-muted)", boxShadow:mode===k?"var(--shadow-sm)":"none" }}>
                {l}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {mode === "bureau" ? (
              <motion.form key="b" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onSubmit={onSubmit}>
                <div className="form-grid">
                  <div className="field" style={{ gridColumn:"1/-1" }}>
                    <label>Applicant name</label>
                    <input value={bureau.applicantName} onChange={e=>upB("applicantName",e.target.value)} placeholder="e.g. Asha Menon" />
                  </div>
                  <Field label="Monthly income (₹)" value={bureau.monthlyIncome} onChange={v=>upB("monthlyIncome",v)} />
                  <Field label="Monthly EMI outgo (₹)" value={bureau.monthlyEmiOutgo} onChange={v=>upB("monthlyEmiOutgo",v)} />
                  <Field label="Credit utilization (%)" value={bureau.creditUtilizationPct} onChange={v=>upB("creditUtilizationPct",v)} />
                  <Field label="Late payments (24m)" value={bureau.latePayments24m} onChange={v=>upB("latePayments24m",v)} />
                  <Field label="Loan-to-value (%)" value={bureau.loanToValuePct} onChange={v=>upB("loanToValuePct",v)} />
                  <Field label="Years employed" value={bureau.yearsEmployed} onChange={v=>upB("yearsEmployed",v)} />
                  <div className="field" style={{ gridColumn:"1/-1" }}>
                    <label>Requested loan amount (₹)</label>
                    <input type="number" value={bureau.loanAmount} onChange={e=>upB("loanAmount",e.target.value)} />
                  </div>
                  <div className="field field-checkbox" style={{ gridColumn:"1/-1" }}>
                    <input type="checkbox" checked={bureau.existingNpaFlag} onChange={e=>upB("existingNpaFlag",e.target.checked)} />
                    <label style={{ margin:0 }}>Has an existing NPA on record</label>
                  </div>
                </div>
                <motion.button className="btn btn-primary" style={{ marginTop:18, width:"100%" }} disabled={loading} whileTap={{ scale:0.98 }}>
                  {loading ? "Scoring…" : "Run Risk Assessment"}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form key="t" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onSubmit={onSubmit}>
                <div style={{ padding:"12px 14px", background:"var(--teal-glow)", border:"1px solid var(--teal-border)", borderRadius:"var(--r-sm)", marginBottom:16 }}>
                  <p style={{ fontSize:12, color:"var(--teal)", lineHeight:1.5 }}>For gig workers, young borrowers, and anyone without bureau history — scored on cash-flow patterns and utility-payment consistency instead.</p>
                </div>
                <div className="form-grid">
                  <div className="field" style={{ gridColumn:"1/-1" }}>
                    <label>Applicant name</label>
                    <input value={thin.applicantName} onChange={e=>upT("applicantName",e.target.value)} placeholder="e.g. Karan Mehta" />
                  </div>
                  <Field label="Monthly income (₹)" value={thin.monthlyIncome} onChange={v=>upT("monthlyIncome",v)} />
                  <Field label="Requested loan amount (₹)" value={thin.loanAmount} onChange={v=>upT("loanAmount",v)} />
                  <Field label="Utility payment consistency (%)" value={thin.utilityPaymentConsistencyPct} onChange={v=>upT("utilityPaymentConsistencyPct",v)} />
                  <Field label="Cash-flow stability (0-100)" value={thin.cashFlowStabilityScore} onChange={v=>upT("cashFlowStabilityScore",v)} />
                  <div className="field" style={{ gridColumn:"1/-1" }}>
                    <label>Months of alternative-data history</label>
                    <input type="number" value={thin.monthsOfAltData} onChange={e=>upT("monthsOfAltData",e.target.value)} />
                  </div>
                </div>
                <motion.button className="btn btn-teal" style={{ marginTop:18, width:"100%" }} disabled={loading} whileTap={{ scale:0.98 }}>
                  {loading ? "Scoring…" : "Run Alternative-Data Assessment"}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </Card>

        {/* Result */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <Card title="Risk Readout">
            {result ? (
              <motion.div initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }}>
                <TrustRadar value={gaugeVal} displayValue={result.riskScore} title="Risk Score" sublabel={`${(result.probabilityOfDefault*100).toFixed(1)}% probability of default`} accent={ac} />
                <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:8 }}>
                  <Badge tone={result.riskCategory}>{result.riskCategory} risk</Badge>
                  <span className="tag-chip">{result.scoringMethod==="alternative-data" ? "ALT-DATA" : "BUREAU"}</span>
                </div>
                <div style={{ marginTop:18, padding:"12px 14px", background:"var(--bg-overlay)", borderRadius:"var(--r-sm)", border:"1px solid var(--border-soft)" }}>
                  <div style={{ fontSize:11, color:"var(--text-muted)", fontFamily:"var(--font-mono)", marginBottom:4 }}>DECISION</div>
                  <div style={{ fontSize:13, color:"var(--text-primary)" }}>{result.decision}</div>
                </div>
                <div style={{ marginTop:14 }}>
                  <div style={{ fontSize:11, color:"var(--text-muted)", fontFamily:"var(--font-mono)", marginBottom:8 }}>TOP FACTORS</div>
                  <ul className="flag-list">
                    {result.topFactors?.map(f => (
                      <li key={f.factor}><span className="flag-dot" style={{ background: f.impact.includes("Increase") ? "var(--coral)" : "var(--teal)" }} />
                        <span><strong style={{ color:"var(--text-primary)" }}>{f.factor}</strong> — {f.impact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ) : (
              <EmptyState icon={BarChart2} title="No result yet" sub="Submit an applicant profile to see the risk score and explainability breakdown." />
            )}
          </Card>
        </div>
      </div>

      {/* Recent table */}
      <Card title="Recent Applications" subtitle="Most recent scored on this server" style={{ marginTop:20 }}>
        <div className="table-wrap">
          <table className="ledger">
            <thead><tr><th>Applicant</th><th>Method</th><th>Score</th><th>Category</th><th>Decision</th></tr></thead>
            <tbody>
              {recent.map(r => (
                <tr key={r.id}>
                  <td>{r.applicantName}</td>
                  <td><span className="tag-chip">{r.scoringMethod==="alternative-data" ? "Alt-Data" : "Bureau"}</span></td>
                  <td><span style={{ fontFamily:"var(--font-mono)", fontWeight:600 }}>{r.riskScore}</span></td>
                  <td><Badge tone={r.riskCategory}>{r.riskCategory}</Badge></td>
                  <td style={{ color:"var(--text-secondary)", fontSize:12 }}>{r.decision}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {recent.length===0 && <EmptyState icon={FileText} title="No applications yet" sub="Run an assessment above." />}
        </div>
      </Card>
    </div>
  );
}
