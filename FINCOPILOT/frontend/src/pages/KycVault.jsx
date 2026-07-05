import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanFace, AlertTriangle, CheckCircle2, Shield } from "lucide-react";
import Card from "../components/Card.jsx";
import Badge from "../components/Badge.jsx";
import TrustRadar from "../components/TrustRadar.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { api } from "../lib/api.js";
import { useToast } from "../lib/ToastContext.jsx";

const STATUS_COLOR = { APPROVED:"var(--teal)", MANUAL_REVIEW:"var(--amber)", REJECTED:"var(--coral)" };

const STEPS = [
  { n:1, label:"Document Capture" },
  { n:2, label:"Liveness Challenge" },
  { n:3, label:"Decision" },
];

export default function KycVault() {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [fields, setFields] = useState({ applicantName:"", phone:"", deviceId:"", documentProvided:false, deviceFlaggedEmulator:false });
  const [challenge, setChallenge] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState([]);
  const up = (k,v) => setFields(f=>({...f,[k]:v}));

  useEffect(() => { api.listKyc().then(setRecent).catch(()=>{}); }, []);

  async function startLiveness() {
    try { const r = await api.getKycChallenge(); setChallenge(r.livenessChallengeCode); setStep(2); }
    catch(err) { toast.error(err.message); }
  }

  async function submit() {
    setLoading(true);
    try {
      const res = await api.submitKyc({ ...fields, livenessChallengeCode:challenge, applicantName:fields.applicantName||"Unnamed" });
      setResult(res); setStep(3);
      if(res.syntheticIdentityFlag) toast.error(`Synthetic identity flag: linked to ${res.linkedIdentityCount} other name(s)`);
      else toast[res.status==="APPROVED"?"success":res.status==="REJECTED"?"error":"info"](`${res.status.replace(/_/g," ")} · Confidence ${res.livenessConfidence}%`);
      api.listKyc().then(setRecent).catch(()=>{});
    } catch(err){ toast.error(err.message); }
    finally{ setLoading(false); }
  }

  function reset() { setStep(1); setFields({ applicantName:"", phone:"", deviceId:"", documentProvided:false, deviceFlaggedEmulator:false }); setResult(null); setChallenge(""); }

  return (
    <div>
      <div className="page-head">
        <span className="page-eyebrow">KY-03 · KYC Vault</span>
        <h1 className="page-title">KYC <span className="gradient-text">Vault</span></h1>
        <p className="page-sub">Layered onboarding: document capture · randomized liveness challenge · device integrity · cross-record synthetic-identity linkage check. No single signal can pass an applicant alone.</p>
      </div>

      <div className="two-col">
        <Card>
          {/* Step indicator */}
          <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:24 }}>
            {STEPS.map((s,i)=>(
              <div key={s.n} style={{ display:"flex", alignItems:"center", flex:i<STEPS.length-1?1:"none" }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  <div style={{ width:30, height:30, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", border:`2px solid ${step>s.n?"var(--teal)":step===s.n?"var(--gold)":"var(--border-soft)"}`, background:step>s.n?"var(--teal-glow)":step===s.n?"var(--gold-glow)":"transparent", color:step>s.n?"var(--teal)":step===s.n?"var(--gold)":"var(--text-muted)", fontWeight:700, fontSize:12 }}>
                    {step>s.n ? <CheckCircle2 size={14} /> : s.n}
                  </div>
                  <div style={{ fontSize:10, color:step===s.n?"var(--gold)":"var(--text-muted)", whiteSpace:"nowrap", fontFamily:"var(--font-mono)", letterSpacing:"0.04em" }}>{s.label}</div>
                </div>
                {i<STEPS.length-1 && <div style={{ flex:1, height:2, background:step>s.n+1?"var(--teal)":"var(--border-soft)", margin:"0 8px", marginBottom:20, borderRadius:2 }} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step===1 && (
              <motion.div key="s1" initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}}>
                <div className="form-grid" style={{marginBottom:16}}>
                  <div className="field" style={{gridColumn:"1/-1"}}><label>Applicant name</label><input value={fields.applicantName} onChange={e=>up("applicantName",e.target.value)} placeholder="e.g. Asha Menon" /></div>
                  <div className="field"><label>Phone number <span style={{color:"var(--text-muted)",fontWeight:400}}>(for linkage check)</span></label><input value={fields.phone} onChange={e=>up("phone",e.target.value)} placeholder="98765xxxxx" /></div>
                  <div className="field"><label>Device ID <span style={{color:"var(--text-muted)",fontWeight:400}}>(for linkage check)</span></label><input value={fields.deviceId} onChange={e=>up("deviceId",e.target.value)} placeholder="DEV-XXXXX" /></div>
                </div>
                <div style={{padding:"10px 12px",background:"var(--bg-overlay)",borderRadius:"var(--r-sm)",marginBottom:16,fontSize:12,color:"var(--text-secondary)"}}>
                  💡 Tip: submit two applicants with the same phone/device but different names to see the synthetic-identity check flag the second one.
                </div>
                <div className="field field-checkbox" style={{marginBottom:16}}>
                  <input type="checkbox" checked={fields.documentProvided} onChange={e=>up("documentProvided",e.target.checked)} />
                  <label style={{margin:0}}>Government ID document captured (Aadhaar / PAN)</label>
                </div>
                <button className="btn btn-primary" onClick={startLiveness}>Continue to Liveness Challenge →</button>
              </motion.div>
            )}

            {step===2 && (
              <motion.div key="s2" initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}}>
                <p style={{fontSize:13,marginBottom:16}}>Ask the applicant to read this code aloud on camera. A fresh code each session defeats pre-recorded or AI-generated clips.</p>
                <div style={{ textAlign:"center", padding:"24px 0 20px", background:"var(--bg-overlay)", borderRadius:"var(--r-md)", marginBottom:18, border:"1px solid var(--gold-border)" }}>
                  <div style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--text-muted)",marginBottom:8,letterSpacing:"0.1em"}}>LIVENESS CHALLENGE CODE</div>
                  <div style={{fontFamily:"var(--font-display)",fontSize:52,fontWeight:700,letterSpacing:"0.15em",background:"linear-gradient(135deg,var(--gold-bright),var(--teal-bright))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{challenge}</div>
                </div>
                <div className="field field-checkbox" style={{marginBottom:18}}>
                  <input type="checkbox" checked={fields.deviceFlaggedEmulator} onChange={e=>up("deviceFlaggedEmulator",e.target.checked)} />
                  <label style={{margin:0}}>Simulate: device flagged as emulator / virtual camera</label>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button className="btn btn-ghost btn-sm" onClick={()=>setStep(1)}>← Back</button>
                  <motion.button className="btn btn-primary" onClick={submit} disabled={loading} whileTap={{scale:0.97}}>
                    {loading?"Verifying…":"Submit Verification →"}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step===3 && result && (
              <motion.div key="s3" initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}}>
                <TrustRadar value={result.livenessConfidence} displayValue={`${result.livenessConfidence}%`} title="Liveness Confidence" sublabel={result.applicantName} accent={STATUS_COLOR[result.status]} />
                <div style={{textAlign:"center",margin:"8px 0 14px"}}>
                  <Badge tone={result.status}>{result.status.replace(/_/g," ")}</Badge>
                </div>
                {result.syntheticIdentityFlag && (
                  <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} style={{ display:"flex",gap:10,alignItems:"flex-start",padding:"12px 14px",background:"var(--coral-glow)",border:"1px solid var(--coral-border)",borderRadius:"var(--r-sm)",marginBottom:14 }}>
                    <AlertTriangle size={16} color="var(--coral)" style={{flexShrink:0,marginTop:1}} />
                    <div style={{fontSize:12.5,color:"var(--coral)",lineHeight:1.5}}>
                      <strong>Synthetic identity signal:</strong> This phone/device is already linked to {result.linkedIdentityCount} other applicant name(s) — a real indicator of identity fraud.
                    </div>
                  </motion.div>
                )}
                <button className="btn btn-ghost" style={{width:"100%"}} onClick={reset}>Run Another Onboarding</button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <Card title="Why Layered Checks Matter">
          <ul className="flag-list">
            {[
              "A static photo bypasses a single face-match check.",
              "A deepfake clip passes a fixed liveness prompt — randomized codes defeat pre-recordings.",
              "Device-integrity flags catch emulators used for bulk synthetic-account creation.",
              "Cross-record phone/device linkage detects synthetic identities assembled from real fragments — the gap standard KYC misses.",
              "Borderline cases route to manual review, not automatic pass — the same principle as bank step-up auth.",
            ].map((t,i)=>(
              <li key={i}><span className="flag-dot" /><span style={{fontSize:13}}>{t}</span></li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Recent Onboarding Attempts" style={{marginTop:20}}>
        <div className="table-wrap">
          <table className="ledger">
            <thead><tr><th>Applicant</th><th>Document</th><th>Liveness Confidence</th><th>Status</th></tr></thead>
            <tbody>
              {recent.map(k=>(
                <tr key={k.id}>
                  <td>{k.applicantName}</td>
                  <td><Badge tone={k.documentProvided?"approved":"high"}>{k.documentProvided?"Provided":"Missing"}</Badge></td>
                  <td><span style={{fontFamily:"var(--font-mono)",fontWeight:600}}>{k.livenessConfidence}%</span></td>
                  <td><Badge tone={k.status}>{k.status.replace(/_/g," ")}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {recent.length===0 && <EmptyState icon={ScanFace} title="No onboarding attempts yet" sub="Run the 3-step flow above to see results here." />}
        </div>
      </Card>
    </div>
  );
}
