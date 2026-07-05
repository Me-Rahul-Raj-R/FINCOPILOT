import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Send, ScanLine, Receipt, Smartphone, Zap, Droplet, Wifi, CreditCard, X, Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import Card from "../components/Card.jsx";
import Badge from "../components/Badge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { api } from "../lib/api.js";
import { useToast } from "../lib/ToastContext.jsx";

const BILLS = [
  { key:"Electricity", icon:Zap, color:"var(--gold)" },
  { key:"Water", icon:Droplet, color:"var(--teal)" },
  { key:"Broadband", icon:Wifi, color:"var(--coral)" },
  { key:"Credit Card", icon:CreditCard, color:"var(--violet)" },
];
const AV_COLORS = ["var(--teal)","var(--gold)","var(--coral)","var(--violet)","var(--amber)"];
const av = name => AV_COLORS[name.charCodeAt(0) % AV_COLORS.length];
const initials = name => name.split(" ").map(p=>p[0]).slice(0,2).join("").toUpperCase();

function fire() {
  confetti({ particleCount:90, spread:70, startVelocity:35, origin:{y:0.6}, colors:["#e8b84b","#38d9c8","#f0f4ff"] });
}

function Modal({ children, onClose }) {
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      onClick={onClose}
      style={{ position:"fixed",inset:0,background:"rgba(4,8,18,0.75)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20 }}>
      <motion.div initial={{scale:0.94,opacity:0,y:12}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0.94,opacity:0}} transition={{duration:0.22,ease:[0.22,1,0.36,1]}}
        onClick={e=>e.stopPropagation()}
        style={{ width:"100%",maxWidth:400,background:"var(--bg-elevated)",border:"1px solid var(--border-strong)",borderRadius:"var(--r-xl)",padding:28,position:"relative",boxShadow:"var(--shadow-lg)" }}>
        <button onClick={onClose} style={{ position:"absolute",top:16,right:16,background:"var(--bg-overlay)",border:"1px solid var(--border-soft)",borderRadius:"var(--r-sm)",width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--text-muted)" }}>
          <X size={14} />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function Pay() {
  const toast = useToast();
  const [wallet, setWallet] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [billType, setBillType] = useState(null);
  const [stepUp, setStepUp] = useState(null);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const qrRef = useRef(null);

  function refresh() {
    api.getWallet().then(setWallet).catch(()=>{});
    api.walletContacts().then(r=>setContacts(r.contacts)).catch(()=>{});
  }
  useEffect(refresh, []);

  function openSend(c) { setSelected(c); setAmount(""); setNote(""); setError(""); setStepUp(null); setOtp(""); setModal("send"); }
  function close() { setModal(null); setStepUp(null); setBillType(null); setError(""); }

  async function send(confirm=false) {
    setError(""); setBusy(true);
    try {
      const payload = { contactName:selected?.name||"Unknown", contactAccount:selected?.account, amount:+amount, note, confirmStepUp:confirm };
      const res = await api.sendMoney(payload);
      if(res.requiresStepUp) { setStepUp(payload); toast.info("Step-up required — enter any 4-digit code"); }
      else { fire(); close(); refresh(); toast.success(`₹${Number(amount).toLocaleString("en-IN")} sent to ${payload.contactName}`); }
    } catch(err) { setError(err.message); toast.error(err.message); }
    finally { setBusy(false); }
  }

  async function payBill(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      await api.payBill({ billType, amount:+amount });
      fire(); close(); refresh(); toast.success(`₹${Number(amount).toLocaleString("en-IN")} paid for ${billType}`);
    } catch(err) { setError(err.message); toast.error(err.message); }
    finally { setBusy(false); }
  }

  return (
    <div>
      <div className="page-head">
        <span className="page-eyebrow">PY-07 · Pay</span>
        <h1 className="page-title">Pay<span className="gradient-text"> &amp; Wallet</span></h1>
        <p className="page-sub">GPay/PhonePe-style wallet — every send is scored live by the FR-02 Fraud Shield engine. P2P sends to real platform users actually credit their wallet.</p>
      </div>

      {/* Glassmorphic balance card */}
      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
        style={{ position:"relative",overflow:"hidden",borderRadius:"var(--r-xl)",padding:"28px 28px 24px",marginBottom:22,background:"linear-gradient(135deg,rgba(13,23,41,0.9),rgba(17,31,56,0.9))",border:"1px solid var(--gold-border)",backdropFilter:"blur(20px)" }}>
        <div aria-hidden style={{ position:"absolute",top:-50,right:-30,width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,rgba(232,184,75,0.20),transparent 70%)",pointerEvents:"none" }} />
        <div aria-hidden style={{ position:"absolute",bottom:-40,left:-20,width:150,height:150,borderRadius:"50%",background:"radial-gradient(circle,rgba(56,217,200,0.12),transparent 70%)",pointerEvents:"none" }} />
        <div style={{ fontFamily:"var(--font-mono)",fontSize:10,letterSpacing:"0.12em",color:"var(--gold)",marginBottom:6,textTransform:"uppercase" }}>Wallet Balance</div>
        <div style={{ fontFamily:"var(--font-display)",fontSize:46,fontWeight:700,letterSpacing:"-0.03em",background:"linear-gradient(135deg,var(--gold-bright),var(--teal-bright))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>
          {wallet ? `₹${wallet.balance.toLocaleString("en-IN")}` : "—"}
        </div>
        <div style={{ fontFamily:"var(--font-mono)",fontSize:11,color:"var(--text-muted)",marginTop:4 }}>{wallet?.accountCode}</div>
        <div style={{ display:"flex",gap:10,marginTop:20,flexWrap:"wrap" }}>
          {[{icon:Send,label:"Send",ac:"var(--gold)",fn:()=>openSend(null)},{icon:ScanLine,label:"Scan QR",ac:"var(--teal)",fn:()=>setModal("qr")},{icon:Receipt,label:"Pay Bills",ac:"var(--coral)",fn:()=>setModal("bill")},{icon:Smartphone,label:"Recharge",ac:"var(--violet)",fn:()=>{ setBillType("Mobile Recharge"); setAmount(""); setModal("bill"); }}].map(a=>(
            <motion.button key={a.label} type="button" onClick={a.fn} whileHover={{y:-2}} whileTap={{scale:0.96}}
              style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:7,background:`${a.ac}18`,border:`1px solid ${a.ac}35`,borderRadius:"var(--r-md)",padding:"12px 18px",cursor:"pointer",color:a.ac,fontSize:12,fontWeight:500 }}>
              <a.icon size={20} />{a.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Contacts */}
      <Card title="Contacts" subtitle="Tap a contact to send money instantly" style={{marginBottom:20}}>
        <div style={{ display:"flex",gap:16,overflowX:"auto",paddingBottom:6 }}>
          {contacts.map(c=>(
            <motion.button key={c.account} type="button" onClick={()=>openSend(c)} whileHover={{y:-2}} whileTap={{scale:0.96}}
              style={{ flexShrink:0,textAlign:"center",background:"none",border:"none",cursor:"pointer",width:64 }}>
              <div style={{ width:48,height:48,borderRadius:"50%",background:av(c.name),color:"var(--bg-base)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:15,margin:"0 auto 6px",boxShadow:`0 0 0 2px var(--bg-elevated),0 0 0 3px ${av(c.name)}55` }}>
                {initials(c.name)}
              </div>
              <div style={{ fontSize:10,color:"var(--text-muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{c.name.split(" ")[0]}</div>
            </motion.button>
          ))}
          {contacts.length===0 && <p style={{fontSize:12,color:"var(--text-muted)"}}>Sign up a second account to see platform contacts here.</p>}
        </div>
      </Card>

      {/* Bills */}
      <Card title="Pay Bills" style={{marginBottom:20}}>
        <div className="grid grid-4">
          {BILLS.map(b=>(
            <motion.button key={b.key} type="button" onClick={()=>{ setBillType(b.key); setAmount(""); setModal("bill"); }} whileHover={{y:-3}} whileTap={{scale:0.97}}
              style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:10,padding:"16px 8px",background:`${b.color}10`,border:`1px solid ${b.color}30`,borderRadius:"var(--r-md)",cursor:"pointer",color:b.color }}>
              <b.icon size={22} />
              <span style={{ fontSize:12,fontWeight:500 }}>{b.key}</span>
            </motion.button>
          ))}
        </div>
      </Card>

      {/* History */}
      <Card title="Transaction History">
        <div className="table-wrap">
          <table className="ledger">
            <thead><tr><th>Type</th><th>Counterparty</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {wallet?.transactions.map(t=>{
                const credit = t.type==="RECEIVE";
                return (
                  <tr key={t.id}>
                    <td style={{display:"flex",alignItems:"center",gap:7}}>
                      <div style={{ width:26,height:26,borderRadius:"50%",background:credit?"var(--teal-glow)":"var(--coral-glow)",display:"flex",alignItems:"center",justifyContent:"center",color:credit?"var(--teal)":"var(--coral)" }}>
                        {credit ? <ArrowDownLeft size={13}/> : <ArrowUpRight size={13}/>}
                      </div>
                      {t.type.replace(/_/g," ")}
                    </td>
                    <td>{t.counterparty}</td>
                    <td style={{ fontFamily:"var(--font-mono)",fontWeight:600,color:credit?"var(--teal)":"var(--coral)" }}>
                      {credit?"+":"-"}₹{Number(t.amount).toLocaleString("en-IN")}
                    </td>
                    <td><Badge tone={t.status}>{t.status}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {(!wallet||wallet.transactions.length===0) && <EmptyState icon={Wallet} title="No wallet activity yet" sub="Send money or pay a bill above." />}
        </div>
      </Card>

      {/* Modals */}
      <AnimatePresence>
        {modal==="send" && (
          <Modal onClose={close}>
            <h3 style={{marginBottom:4,fontSize:18}}>Send Money</h3>
            <p style={{fontSize:13,marginBottom:18}}>to {selected?.name||"a contact"}</p>
            {error && <div className="error-banner" style={{fontSize:12}}>{error}</div>}
            {!stepUp ? (
              <div>
                {!selected && (
                  <div className="field" style={{marginBottom:12}}>
                    <label>To (name or UPI ID)</label>
                    <input value={selected?.name||""} onChange={e=>setSelected({name:e.target.value,account:e.target.value})} placeholder="Contact name or UPI ID" />
                  </div>
                )}
                <div className="field" style={{marginBottom:12}}><label>Amount (₹)</label><input type="number" min="1" value={amount} onChange={e=>setAmount(e.target.value)} /></div>
                <div className="field" style={{marginBottom:20}}><label>Note (optional)</label><input value={note} onChange={e=>setNote(e.target.value)} placeholder="What's this for?" /></div>
                <motion.button className="btn btn-primary btn-block" onClick={()=>send(false)} disabled={busy||!amount} whileTap={{scale:0.97}}>
                  {busy?"Sending…":"Send →"}
                </motion.button>
              </div>
            ) : (
              <div>
                <div style={{padding:"12px 14px",background:"var(--amber-glow)",border:"1px solid var(--amber-border)",borderRadius:"var(--r-sm)",marginBottom:14}}>
                  <p style={{fontSize:12,color:"var(--amber)"}}>Fraud Shield flagged this payment as unusual. Enter a one-time code to confirm (any 4+ digits in this demo).</p>
                </div>
                <div className="field" style={{marginBottom:16}}><label>One-time code</label><input value={otp} onChange={e=>setOtp(e.target.value)} placeholder="1234" className="mono" /></div>
                <motion.button className="btn btn-primary btn-block" onClick={()=>send(true)} disabled={busy||otp.length<4} whileTap={{scale:0.97}}>
                  {busy?"Confirming…":"Confirm & Send"}
                </motion.button>
              </div>
            )}
          </Modal>
        )}
        {modal==="qr" && (
          <Modal onClose={close}>
            <h3 style={{marginBottom:8,fontSize:18}}>Scan QR</h3>
            <p style={{fontSize:12,marginBottom:16}}>Camera scanning not wired in this demo — enter the payee code manually.</p>
            <div className="field" style={{marginBottom:16}}><label>Payee UPI ID / code</label><input ref={qrRef} placeholder="merchant@upi" /></div>
            <motion.button className="btn btn-primary btn-block" onClick={()=>{ close(); openSend({name:qrRef.current?.value||"QR Contact",account:qrRef.current?.value}); }} whileTap={{scale:0.97}}>Continue to Send</motion.button>
          </Modal>
        )}
        {modal==="bill" && (
          <Modal onClose={close}>
            <h3 style={{marginBottom:16,fontSize:18}}>Pay · {billType||"Choose a bill"}</h3>
            {error && <div className="error-banner" style={{fontSize:12}}>{error}</div>}
            <form onSubmit={payBill}>
              {!billType && (
                <div className="field" style={{marginBottom:12}}><label>Biller</label>
                  <select value={billType||""} onChange={e=>setBillType(e.target.value)} required>
                    <option value="" disabled>Choose…</option>
                    {BILLS.map(b=><option key={b.key} value={b.key}>{b.key}</option>)}
                  </select>
                </div>
              )}
              <div className="field" style={{marginBottom:20}}><label>Amount (₹)</label><input type="number" min="1" required value={amount} onChange={e=>setAmount(e.target.value)} /></div>
              <motion.button className="btn btn-primary btn-block" disabled={busy} whileTap={{scale:0.97}}>
                {busy?"Paying…":"Pay Now →"}
              </motion.button>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
