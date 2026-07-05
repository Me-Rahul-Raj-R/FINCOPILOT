import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Radar, Zap, TrendingDown } from "lucide-react";
import Card from "../components/Card.jsx";
import Badge from "../components/Badge.jsx";
import TrustRadar from "../components/TrustRadar.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { api } from "../lib/api.js";
import { useToast } from "../lib/ToastContext.jsx";

const DECISION_COLOR = { ALLOW:"var(--teal)", STEP_UP_AUTH:"var(--amber)", HOLD_FOR_REVIEW:"var(--coral)", BLOCK:"var(--coral)" };
const DEF = { senderAccount:"ACC1001", receiverAccount:"ACC2002", amount:5000, channel:"UPI", newDevice:false, newBeneficiary:false };

export default function FraudShield() {
  const toast = useToast();
  const [form, setForm] = useState(DEF);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simBusy, setSimBusy] = useState(false);
  const [recent, setRecent] = useState([]);
  const up = (k,v) => setForm(f=>({...f,[k]:v}));

  useEffect(() => { api.listTransactions().then(setRecent).catch(()=>{}); }, []);

  async function evalTxn(payload) {
    const res = await api.checkTransaction(payload);
    setResult(res); return res;
  }

  async function onSubmit(e) {
    e.preventDefault(); setLoading(true);
    try {
      const res = await evalTxn({...form, amount:+form.amount});
      const lvl = res.decision==="ALLOW" ? "success" : res.decision==="BLOCK" ? "error" : "info";
      toast[lvl](`${res.decision.replace(/_/g," ")} · risk score ${res.fraudRiskScore}`);
      api.listTransactions().then(setRecent).catch(()=>{});
    } catch(err){ toast.error(err.message); }
    finally{ setLoading(false); }
  }

  async function runSim(type) {
    setSimBusy(true);
    const sender = `${type.toUpperCase()}-${Math.floor(Math.random()*900+100)}`;
    try {
      if(type==="mule") {
        for(let i=1;i<=6;i++) {
          await evalTxn({ senderAccount:sender, receiverAccount:`LAYER-${i}-${Math.random().toFixed(2).slice(2)}`, amount:40000+Math.floor(Math.random()*8000), channel:"UPI", newBeneficiary:true });
        }
        toast.info("Mule layering complete — watch decision escalate ALLOW→BLOCK");
      } else {
        for(let i=0;i<5;i++) {
          await evalTxn({ senderAccount:sender, receiverAccount:"SAME-DEST", amount:47500+Math.floor(Math.random()*2000), channel:"UPI" });
        }
        toast.info("Structuring simulation complete — AML smurfing pattern detected");
      }
      api.listTransactions().then(setRecent).catch(()=>{});
    } catch(err){ toast.error(err.message); }
    finally{ setSimBusy(false); }
  }

  const ac = result ? (DECISION_COLOR[result.decision]||"var(--teal)") : "var(--teal)";

  return (
    <div>
      <div className="page-head">
        <span className="page-eyebrow">FR-02 · Fraud Shield</span>
        <h1 className="page-title">Fraud <span className="gradient-text">Shield</span></h1>
        <p className="page-sub">Four-signal detection engine: amount z-score · velocity · beneficiary fan-out (mule layering) · structuring (AML smurfing). Applied live to every wallet send.</p>
      </div>

      <div className="two-col">
        <Card title="Check a Transaction">
          <form onSubmit={onSubmit}>
            <div className="form-grid" style={{ marginBottom:16 }}>
              <div className="field"><label>Sender account</label><input value={form.senderAccount} onChange={e=>up("senderAccount",e.target.value)} /></div>
              <div className="field"><label>Receiver account</label><input value={form.receiverAccount} onChange={e=>up("receiverAccount",e.target.value)} /></div>
              <div className="field"><label>Amount (₹)</label><input type="number" min="1" value={form.amount} onChange={e=>up("amount",e.target.value)} /></div>
              <div className="field"><label>Channel</label>
                <select value={form.channel} onChange={e=>up("channel",e.target.value)}>
                  {["UPI","IMPS","NEFT","CARD"].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="field field-checkbox">
                <input type="checkbox" checked={form.newDevice} onChange={e=>up("newDevice",e.target.checked)} />
                <label style={{ margin:0 }}>New / unrecognized device</label>
              </div>
              <div className="field field-checkbox">
                <input type="checkbox" checked={form.newBeneficiary} onChange={e=>up("newBeneficiary",e.target.checked)} />
                <label style={{ margin:0 }}>First-time beneficiary</label>
              </div>
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <motion.button className="btn btn-primary" disabled={loading} whileTap={{scale:0.97}}>
                {loading ? "Evaluating…" : "Evaluate Transaction"}
              </motion.button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={()=>runSim("mule")} disabled={simBusy}>
                <TrendingDown size={13} /> {simBusy?"Running…":"Simulate Mule Layering"}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={()=>runSim("struct")} disabled={simBusy}>
                <Zap size={13} /> {simBusy?"Running…":"Simulate AML Structuring"}
              </button>
            </div>
          </form>
        </Card>

        <Card title="Risk Readout">
          {result ? (
            <motion.div initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}}>
              <TrustRadar value={result.fraudRiskScore} displayValue={result.fraudRiskScore} title="Fraud Risk Score" sublabel={`${result.senderAccount} → ${result.receiverAccount}`} accent={ac} />
              <div style={{textAlign:"center",marginTop:6,marginBottom:14}}>
                <Badge tone={result.decision}>{result.decision.replace(/_/g," ")}</Badge>
              </div>
              <div style={{ fontSize:11, color:"var(--text-muted)", fontFamily:"var(--font-mono)", marginBottom:8 }}>SIGNALS DETECTED</div>
              <ul className="flag-list">
                {result.flags.map((f,i)=>(
                  <li key={i}><span className="flag-dot" style={{ background:result.fraudRiskScore>50?"var(--coral)":"var(--teal)" }} /><span style={{fontSize:12.5}}>{f}</span></li>
                ))}
              </ul>
            </motion.div>
          ) : (
            <EmptyState icon={Radar} title="No evaluation yet" sub="Submit a transaction or run a simulation to see the risk score and detection signals." />
          )}
        </Card>
      </div>

      <Card title="Recent Transactions" style={{marginTop:20}}>
        <div className="table-wrap">
          <table className="ledger">
            <thead><tr><th>Sender</th><th>Receiver</th><th>Amount</th><th>Risk Score</th><th>Decision</th></tr></thead>
            <tbody>
              {recent.map(t=>(
                <tr key={t.id}>
                  <td className="mono" style={{fontSize:12}}>{t.senderAccount}</td>
                  <td className="mono" style={{fontSize:12}}>{t.receiverAccount}</td>
                  <td>₹{Number(t.amount).toLocaleString("en-IN")}</td>
                  <td><span style={{fontFamily:"var(--font-mono)",fontWeight:600,color:t.fraudRiskScore>60?"var(--coral)":t.fraudRiskScore>30?"var(--amber)":"var(--teal)"}}>{t.fraudRiskScore}</span></td>
                  <td><Badge tone={t.decision}>{t.decision.replace(/_/g," ")}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {recent.length===0 && <EmptyState icon={Radar} title="No transactions yet" sub="Evaluate a transaction or run a simulation." />}
        </div>
      </Card>
    </div>
  );
}
