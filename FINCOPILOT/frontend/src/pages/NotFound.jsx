import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ShieldCheck, Wallet, Bot } from "lucide-react";

const QUICK = [
  { to:"/", icon:Home, label:"Dashboard", color:"var(--gold)" },
  { to:"/credit-risk", icon:ShieldCheck, label:"Credit Risk", color:"var(--teal)" },
  { to:"/pay", icon:Wallet, label:"Pay", color:"var(--coral)" },
  { to:"/assistant", icon:Bot, label:"Assistant", color:"var(--violet)" },
];

export default function NotFound() {
  return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"65vh",textAlign:"center",padding:"40px 20px" }}>
      <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{duration:0.4}}>
        <div style={{ fontFamily:"var(--font-display)",fontSize:100,fontWeight:700,lineHeight:1,background:"linear-gradient(135deg,var(--border-strong),var(--bg-overlay))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:16 }}>404</div>
        <h1 style={{ fontSize:22,marginBottom:8 }}>Page not found</h1>
        <p style={{ marginBottom:32,maxWidth:340,margin:"0 auto 32px" }}>This route doesn't exist in the FinCopilot ledger.</p>
        <div className="grid grid-4" style={{ maxWidth:440,margin:"0 auto" }}>
          {QUICK.map((q,i)=>(
            <Link key={q.to} to={q.to}>
              <motion.div whileHover={{y:-3}} whileTap={{scale:0.97}} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
                style={{ background:"var(--bg-elevated)",border:`1px solid ${q.color}30`,borderRadius:"var(--r-md)",padding:"16px 8px",textAlign:"center",cursor:"pointer" }}>
                <q.icon size={20} color={q.color} style={{marginBottom:8}} />
                <div style={{fontSize:12,fontWeight:500}}>{q.label}</div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
