import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, ChevronRight } from "lucide-react";
import Card from "../components/Card.jsx";
import { api } from "../lib/api.js";

const WELCOME = { role:"assistant", text:"Hi! I'm the FinCopilot RAG assistant.\n\nI use a real TF-IDF + cosine-similarity retrieval engine over a 25-entry knowledge base covering all 12 unsolved global banking problems and every FinCopilot module.\n\nAsk me anything — my answers are grounded in what I retrieve, and I'll show you exactly which sources I used.", sources:[] };

const GROUPS = [
  { label:"Global Banking Problems", items:["Why are cross-border payments still slow?","What is synthetic identity fraud?","Why is financial inclusion unsolved?","How does AML miss so much money laundering?","What happens on Q-Day?"] },
  { label:"FinCopilot Modules", items:["How does the thin-file credit scoring work?","What 4 signals does Fraud Shield use?","How does KYC detect synthetic identities?","How does the Pay wallet stay safe?","What is the structuring AML signal?"] },
];

function Dot({ delay }) {
  return <motion.div animate={{y:[0,-5,0]}} transition={{duration:0.5,delay,repeat:Infinity}} style={{width:7,height:7,borderRadius:"50%",background:"var(--text-muted)"}} />;
}

export default function Assistant() {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [group, setGroup] = useState(0);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top:scrollRef.current.scrollHeight, behavior:"smooth" });
  }, [messages]);

  async function send(text) {
    const msg = (text ?? input).trim();
    if(!msg || sending) return;
    setMessages(m=>[...m,{ role:"user", text:msg }]);
    setInput(""); setSending(true);
    try {
      const res = await api.chat(msg);
      setMessages(m=>[...m,{ role:"assistant", text:res.reply, sources:res.sources||[] }]);
    } catch(err) {
      setMessages(m=>[...m,{ role:"assistant", text:`Error: ${err.message}`, sources:[] }]);
    } finally { setSending(false); setTimeout(()=>inputRef.current?.focus(),50); }
  }

  return (
    <div>
      <div className="page-head">
        <span className="page-eyebrow">AI-06 · RAG Assistant · TF-IDF + Cosine Similarity</span>
        <h1 className="page-title">AI <span className="gradient-text">Assistant</span></h1>
        <p className="page-sub">Real retrieval-augmented pipeline — no external LLM API needed. Queries matched against 25 knowledge entries, answers grounded in what's retrieved, sources cited under every reply.</p>
      </div>

      <div className="two-col" style={{alignItems:"start"}}>
        {/* Chat window */}
        <Card style={{ display:"flex",flexDirection:"column",height:600,padding:0,overflow:"hidden" }}>
          {/* Header */}
          <div style={{ padding:"14px 18px",borderBottom:"1px solid var(--border-soft)",display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,var(--gold-dim),var(--teal-dim))",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <Bot size={18} color="var(--bg-base)" />
            </div>
            <div>
              <div style={{ fontWeight:600,fontSize:14 }}>FinCopilot Assistant</div>
              <div style={{ fontSize:11,color:"var(--teal)",display:"flex",alignItems:"center",gap:5 }}>
                <span style={{ width:6,height:6,borderRadius:"50%",background:"var(--teal)",display:"inline-block" }} />
                RAG Pipeline Active
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex:1,overflowY:"auto",padding:"16px 18px",display:"flex",flexDirection:"column",gap:14 }}>
            <AnimatePresence initial={false}>
              {messages.map((m,i)=>(
                <motion.div key={i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.2}}
                  style={{ display:"flex",gap:10,flexDirection:m.role==="user"?"row-reverse":"row" }}>
                  <div style={{ width:30,height:30,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:m.role==="user"?"var(--bg-overlay)":"linear-gradient(135deg,var(--gold-dim),var(--teal-dim))",color:m.role==="user"?"var(--text-muted)":"var(--bg-base)" }}>
                    {m.role==="user"?<User size={14}/>:<Bot size={14}/>}
                  </div>
                  <div style={{ maxWidth:"76%",display:"flex",flexDirection:"column",gap:5,alignItems:m.role==="user"?"flex-end":"flex-start" }}>
                    <div style={{ background:m.role==="user"?"var(--bg-overlay)":"var(--bg-elevated)",border:"1px solid var(--border-soft)",borderRadius:m.role==="user"?"14px 4px 14px 14px":"4px 14px 14px 14px",padding:"10px 14px",fontSize:13.5,lineHeight:1.6,whiteSpace:"pre-wrap" }}>
                      {m.text}
                    </div>
                    {m.sources?.length>0 && (
                      <div style={{ display:"flex",flexWrap:"wrap",gap:4,paddingLeft:2 }}>
                        <span style={{ fontSize:10,color:"var(--text-disabled)",alignSelf:"center" }}>Sources:</span>
                        {m.sources.map(s=>(
                          <span key={s.title} title={`Relevance: ${s.score}`} style={{ fontFamily:"var(--font-mono)",fontSize:9,letterSpacing:"0.04em",padding:"2px 7px",borderRadius:"var(--r-pill)",background:s.tag==="module"?"var(--teal-glow)":"var(--gold-glow)",color:s.tag==="module"?"var(--teal)":"var(--gold)",border:`1px solid ${s.tag==="module"?"var(--teal-border)":"var(--gold-border)"}` }}>
                            {s.tag==="module"?"🔧":"📚"} {s.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {sending && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{ display:"flex",gap:10,alignItems:"center" }}>
                <div style={{ width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,var(--gold-dim),var(--teal-dim))",display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <Bot size={14} color="var(--bg-base)" />
                </div>
                <div style={{ background:"var(--bg-elevated)",border:"1px solid var(--border-soft)",borderRadius:"4px 14px 14px 14px",padding:"12px 16px",display:"flex",gap:5 }}>
                  <Dot delay={0}/><Dot delay={0.15}/><Dot delay={0.3}/>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding:"14px 18px",borderTop:"1px solid var(--border-soft)" }}>
            <form onSubmit={e=>{e.preventDefault();send();}} style={{ display:"flex",gap:8 }}>
              <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
                placeholder="Ask about mule accounts, Q-Day, synthetic identity, thin-file scoring…"
                style={{ flex:1,background:"var(--bg-base)",border:"1px solid var(--border-strong)",color:"var(--text-primary)",borderRadius:"var(--r-sm)",padding:"10px 14px",fontSize:13 }} />
              <motion.button className="btn btn-primary" disabled={sending||!input.trim()} whileTap={{scale:0.96}}>
                <Send size={14}/>
              </motion.button>
            </form>
          </div>
        </Card>

        {/* Suggestions + KB info */}
        <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
          <Card title="Ask about…">
            <div style={{ display:"flex",gap:4,marginBottom:14 }}>
              {GROUPS.map((g,i)=>(
                <button key={g.label} type="button" onClick={()=>setGroup(i)}
                  style={{ flex:1,padding:"7px 6px",borderRadius:"var(--r-sm)",border:"1px solid var(--border-soft)",background:group===i?"var(--bg-overlay)":"transparent",color:group===i?"var(--text-primary)":"var(--text-muted)",fontSize:11,cursor:"pointer",fontWeight:group===i?600:400 }}>
                  {g.label}
                </button>
              ))}
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
              {GROUPS[group].items.map(s=>(
                <motion.button key={s} type="button" onClick={()=>send(s)} whileHover={{x:4}}
                  style={{ display:"flex",alignItems:"center",gap:8,background:"none",border:"1px solid var(--border-soft)",borderRadius:"var(--r-sm)",color:"var(--text-secondary)",fontSize:12.5,padding:"9px 12px",cursor:"pointer",textAlign:"left",transition:"all 0.15s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--gold)";e.currentTarget.style.color="var(--text-primary)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border-soft)";e.currentTarget.style.color="var(--text-secondary)";}}>
                  <ChevronRight size={12} color="var(--text-muted)" style={{flexShrink:0}}/>{s}
                </motion.button>
              ))}
            </div>
          </Card>

          <Card title="Knowledge Base" subtitle="What the retriever searches">
            {[
              { emoji:"📚", label:"12 Unsolved Banking Problems", detail:"NPAs, AML, cross-border, Q-Day, synthetic identity, data silos & more" },
              { emoji:"🔧", label:"FinCopilot Module Facts", detail:"CR-01 · FR-02 · KY-03 · CL-04 · SE-05 · PY-07 · AI-06" },
              { emoji:"🏦", label:"Indian Banking Context", detail:"UPI/IMPS, RBI frameworks, PSB NPAs, NPCI, Aadhaar KYC" },
            ].map(item=>(
              <div key={item.label} style={{ display:"flex",gap:10,padding:"10px 0",borderBottom:"1px solid var(--border-soft)" }}>
                <span style={{ fontSize:18,flexShrink:0 }}>{item.emoji}</span>
                <div>
                  <div style={{ fontSize:13,fontWeight:600 }}>{item.label}</div>
                  <div style={{ fontSize:11,color:"var(--text-muted)",marginTop:2 }}>{item.detail}</div>
                </div>
              </div>
            ))}
            <p style={{ fontSize:11,color:"var(--text-muted)",marginTop:12,lineHeight:1.5 }}>🔧 module sources appear in teal · 📚 industry knowledge in gold</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
