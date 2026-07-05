import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Shield, AlertTriangle, Globe, Cpu, RefreshCw } from "lucide-react";
import Card from "../components/Card.jsx";
import Badge from "../components/Badge.jsx";
import StatTile from "../components/StatTile.jsx";
import { api } from "../lib/api.js";
import { useToast } from "../lib/ToastContext.jsx";

const STATUS = { done:"Done", in_progress:"In progress", not_started:"Not started" };
const TONE = { done:"done", in_progress:"progress", not_started:"pending" };

export default function CyberWatch() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ts, setTs] = useState(null);

  function refresh() {
    setLoading(true);
    api.cyberPosture().then(d=>{ setData(d); setTs(new Date()); toast.info("Posture feed refreshed"); }).catch(()=>toast.error("Failed to load posture")).finally(()=>setLoading(false));
  }
  useEffect(refresh, []);

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">SE-05 · Cyber Watch</span>
          <h1 className="page-title">Cyber <span className="gradient-text">Watch</span></h1>
          <p className="page-sub">Security posture snapshot · 7-day login anomaly trend · Post-quantum cryptography migration checklist for the "Q-Day" countdown.</p>
        </div>
        <button className="btn btn-ghost" onClick={refresh} disabled={loading} style={{display:"flex",alignItems:"center",gap:7}}>
          <RefreshCw size={14} className={loading?"spin":""} /> Refresh Feed
        </button>
      </div>

      {!data ? (
        <div className="grid grid-4" style={{marginBottom:20}}>
          {[1,2,3,4].map(i=><div key={i} className="skeleton" style={{height:100,borderRadius:"var(--r-md)"}} />)}
        </div>
      ) : (
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
          <div className="grid grid-4" style={{marginBottom:22}}>
            <StatTile label="Failed Logins Today" value={data.failedLoginsToday} foot="All channels" accent="var(--coral)" icon={AlertTriangle} trend={data.loginTrend.map(d=>d.failedLogins)} />
            <StatTile label="Anomalous Alerts" value={data.anomalousLoginAlerts} foot="Flagged for review" accent="var(--amber)" icon={Shield} trend={data.loginTrend.map(d=>d.anomalous)} />
            <StatTile label="Blocked IP Ranges" value={data.blockedIpRanges} foot="Active block list" accent="var(--teal)" icon={Globe} />
            <StatTile label="Patch Compliance" value={data.patchComplianceRate} formatter={v=>`${v}%`} foot="Fleet-wide coverage" accent={data.patchComplianceRate>=95?"var(--teal)":"var(--amber)"} icon={Cpu} />
          </div>

          <div className="two-col">
            <Card title="7-Day Login Signal Trend" subtitle="Failed logins vs anomalous alerts">
              <div style={{height:240}}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.loginTrend} margin={{top:4,right:8,left:-20,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} />
                    <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tick={{fill:"var(--text-muted)"}} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tick={{fill:"var(--text-muted)"}} />
                    <Tooltip contentStyle={{background:"var(--bg-elevated)",border:"1px solid var(--border-strong)",borderRadius:10,fontSize:12}} labelStyle={{color:"var(--text-primary)"}} />
                    <Legend wrapperStyle={{fontSize:12,color:"var(--text-muted)"}} />
                    <Line type="monotone" dataKey="failedLogins" name="Failed Logins" stroke="var(--gold)" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="anomalous" name="Anomalous" stroke="var(--coral)" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Post-Quantum Readiness" subtitle="Q-Day migration checklist">
              <div style={{padding:"10px 12px",background:"var(--bg-overlay)",borderRadius:"var(--r-sm)",marginBottom:14,border:"1px solid var(--border-soft)"}}>
                <p style={{fontSize:12,lineHeight:1.55}}>Attackers are already running "harvest now, decrypt later" campaigns against RSA/ECC-encrypted banking data. NIST-standardized PQC algorithms (ML-KEM, ML-DSA) need to replace current cryptography before Q-Day arrives.</p>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {data.pqcReadiness.map((item,i)=>(
                  <motion.div key={item.item} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.06}}
                    style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"var(--bg-overlay)",borderRadius:"var(--r-sm)",border:"1px solid var(--border-soft)"}}>
                    <div style={{flex:1,fontSize:12.5,lineHeight:1.4}}>{item.item}</div>
                    <Badge tone={TONE[item.status]}>{STATUS[item.status]}</Badge>
                  </motion.div>
                ))}
              </div>
              {ts && <div style={{fontSize:10,color:"var(--text-disabled)",marginTop:12}}>Updated: {ts.toLocaleTimeString()}</div>}
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
}
