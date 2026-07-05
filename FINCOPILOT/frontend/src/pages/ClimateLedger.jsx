import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Leaf } from "lucide-react";
import Card from "../components/Card.jsx";
import TrustRadar from "../components/TrustRadar.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { api } from "../lib/api.js";
import { useToast } from "../lib/ToastContext.jsx";

function accentFor(s) { return s<45?"var(--teal)":s<70?"var(--amber)":"var(--coral)"; }

export default function ClimateLedger() {
  const toast = useToast();
  const [opts, setOpts] = useState({ industries:[], regions:[] });
  const [form, setForm] = useState({ borrowerName:"", industry:"", region:"", loanTenureYears:10, loanAmount:5000000 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState([]);
  const up = (k,v) => setForm(f=>({...f,[k]:v}));

  useEffect(() => {
    api.climateOptions().then(o => { setOpts(o); setForm(f=>({...f, industry:o.industries[0]||"", region:o.regions[0]||""})); });
    api.listClimate().then(setRecent).catch(()=>{});
  }, []);

  async function onSubmit(e) {
    e.preventDefault(); setLoading(true);
    try {
      const res = await api.assessClimate({ ...form, loanTenureYears:+form.loanTenureYears, loanAmount:+form.loanAmount, borrowerName:form.borrowerName||"Unnamed Borrower" });
      setResult(res);
      toast.info(`Climate-adjusted risk: ${res.climateAdjustedRiskScore} (+${res.riskPremiumPct} pts)`);
      api.listClimate().then(setRecent).catch(()=>{});
    } catch(err){ toast.error(err.message); }
    finally{ setLoading(false); }
  }

  const chartData = result ? [
    { name:"Baseline", score:result.baselineRiskScore, fill:"var(--teal)" },
    { name:"Climate-Adjusted", score:result.climateAdjustedRiskScore, fill: accentFor(result.climateAdjustedRiskScore) },
  ] : [];

  return (
    <div>
      <div className="page-head">
        <span className="page-eyebrow">CL-04 · Climate Ledger</span>
        <h1 className="page-title">Climate <span className="gradient-text">Ledger</span></h1>
        <p className="page-sub">Industry exposure × regional physical-hazard index × loan tenure amplifier → a climate-adjusted risk score for multi-year agricultural and infrastructure lending.</p>
      </div>

      <div className="two-col">
        <Card title="Loan Profile">
          <form onSubmit={onSubmit}>
            <div className="form-grid" style={{marginBottom:16}}>
              <div className="field" style={{gridColumn:"1/-1"}}><label>Borrower / enterprise name</label><input value={form.borrowerName} onChange={e=>up("borrowerName",e.target.value)} placeholder="e.g. Coastal Farms Pvt Ltd" /></div>
              <div className="field"><label>Industry</label>
                <select value={form.industry} onChange={e=>up("industry",e.target.value)}>
                  {opts.industries.map(i=><option key={i}>{i}</option>)}
                </select>
              </div>
              <div className="field"><label>Region</label>
                <select value={form.region} onChange={e=>up("region",e.target.value)}>
                  {opts.regions.map(r=><option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="field"><label>Loan tenure (years)</label><input type="number" min="1" max="30" value={form.loanTenureYears} onChange={e=>up("loanTenureYears",e.target.value)} /></div>
              <div className="field"><label>Loan amount (₹)</label><input type="number" min="0" value={form.loanAmount} onChange={e=>up("loanAmount",e.target.value)} /></div>
            </div>
            <motion.button className="btn btn-teal" style={{width:"100%"}} disabled={loading} whileTap={{scale:0.98}}>
              {loading?"Assessing…":"Run Climate Risk Assessment"}
            </motion.button>
          </form>
        </Card>

        <Card title="Risk Readout">
          {result ? (
            <motion.div initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}}>
              <TrustRadar value={result.climateAdjustedRiskScore} displayValue={result.climateAdjustedRiskScore} title="Climate-Adj. Score" sublabel={`+${result.riskPremiumPct} pts vs baseline ${result.baselineRiskScore}`} accent={accentFor(result.climateAdjustedRiskScore)} />
              <div style={{height:130,marginTop:10}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{top:4,right:8,left:-20,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tick={{fill:"var(--text-muted)"}} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tick={{fill:"var(--text-muted)"}} domain={[0,100]} />
                    <Tooltip contentStyle={{background:"var(--bg-elevated)",border:"1px solid var(--border-strong)",borderRadius:10,fontSize:12}} labelStyle={{color:"var(--text-primary)"}} />
                    <Bar dataKey="score" radius={[6,6,0,0]} fill="var(--gold)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{marginTop:14,padding:"12px 14px",background:"var(--bg-overlay)",borderRadius:"var(--r-sm)",border:"1px solid var(--border-soft)"}}>
                <div style={{fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",marginBottom:4}}>RECOMMENDATION</div>
                <div style={{fontSize:13,color:"var(--text-primary)",lineHeight:1.5}}>{result.recommendation}</div>
              </div>
            </motion.div>
          ) : (
            <EmptyState icon={Leaf} title="No assessment yet" sub="Run a profile to compare baseline vs climate-adjusted scores." />
          )}
        </Card>
      </div>

      <Card title="Recent Assessments" style={{marginTop:20}}>
        <div className="table-wrap">
          <table className="ledger">
            <thead><tr><th>Borrower</th><th>Industry</th><th>Region</th><th>Tenure</th><th>Adjusted Score</th></tr></thead>
            <tbody>
              {recent.map(r=>(
                <tr key={r.id}>
                  <td>{r.borrowerName}</td><td>{r.industry}</td><td style={{fontSize:12}}>{r.region}</td>
                  <td>{r.loanTenureYears}y</td>
                  <td><span style={{fontFamily:"var(--font-mono)",fontWeight:600,color:accentFor(r.climateAdjustedRiskScore)}}>{r.climateAdjustedRiskScore}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {recent.length===0 && <EmptyState icon={Leaf} title="No assessments yet" />}
        </div>
      </Card>
    </div>
  );
}
