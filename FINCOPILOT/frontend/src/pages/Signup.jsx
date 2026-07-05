import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Eye, EyeOff, Wallet, ShieldCheck, Bot, Zap, User, Mail, Lock } from "lucide-react";
import { useAuth } from "../lib/AuthContext.jsx";
import { useToast } from "../lib/ToastContext.jsx";

const FEATURES = [
  { icon: Wallet, color: "var(--gold)", label: "₹25,000 starter wallet", sub: "Ready to send and pay instantly" },
  { icon: ShieldCheck, color: "var(--teal)", label: "Real fraud protection", sub: "Every transfer scored live" },
  { icon: Bot, color: "var(--violet)", label: "AI banking assistant", sub: "Ask anything about 12 banking problems" },
  { icon: Zap, color: "var(--amber)", label: "6 risk modules", sub: "Credit · KYC · Climate · Cyber & more" },
];

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = form, 2 = success animation

  async function onSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await signup(name, email, password);
      setStep(2);
      setTimeout(() => {
        toast.success("Account created! Your ₹25,000 wallet is ready.");
        navigate("/", { replace: true });
      }, 1600);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell" style={{ alignItems: "flex-start", paddingTop: 48 }}>
      <div className="auth-sphere auth-sphere-1" style={{ right: "-150px", top: "-100px" }} />
      <div className="auth-sphere auth-sphere-2" style={{ left: "-80px", bottom: "-80px" }} />

      <div aria-hidden style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(rgba(232,184,75,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(232,184,75,0.025) 1px, transparent 1px)`,
        backgroundSize: "80px 80px",
      }} />

      <div style={{ width: "100%", maxWidth: 900, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, position: "relative", zIndex: 1, alignItems: "start" }}>

        {/* Left — features panel */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ paddingTop: 24 }}
          className="mobile-hide"
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
            <div className="auth-logo-ring" style={{ width: 52, height: 52 }}>
              <svg width="30" height="30" viewBox="0 0 64 64">
                <rect width="64" height="64" rx="14" fill="#0d1729" />
                <path d="M32 10 L50 18 V32 C50 44 42 52 32 56 C22 52 14 44 14 32 V18 Z" fill="none" stroke="#e8b84b" strokeWidth="2.5" />
                <path d="M24 33 L29 38 L40 26" fill="none" stroke="#38d9c8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24 }}>
                Fin<span className="gradient-text">Copilot</span>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                India's AI Banking Ledger
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginBottom: 12 }}>
            One platform.<br />
            <span className="gradient-text">Every banking risk.</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 32, fontSize: 14, lineHeight: 1.65 }}>
            Join FinCopilot and access the same risk intelligence used in our live demo — credit scoring,
            fraud detection, KYC, climate risk, and more, all behind one API and one fraud engine.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                  style={{ display: "flex", alignItems: "center", gap: 14 }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: "var(--r-sm)", flexShrink: 0,
                    background: `${f.color}18`, border: `1px solid ${f.color}33`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={19} color={f.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{f.label}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{f.sub}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div style={{
            marginTop: 32, padding: "16px 18px",
            background: "var(--gold-glow)", border: "1px solid var(--gold-border)",
            borderRadius: "var(--r-md)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Wallet size={15} color="var(--gold)" />
              <span style={{ fontWeight: 600, fontSize: 13, color: "var(--gold)" }}>Starter wallet included</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Every new account gets a ₹25,000 demo wallet pre-loaded and ready to test
              the Pay module, Fraud Shield integration, and P2P transfers instantly.
            </div>
          </div>
        </motion.div>

        {/* Right — signup form */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="auth-card">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h1 className="auth-heading">Create your account</h1>
                  <p className="auth-sub" style={{ marginBottom: 26 }}>Start exploring all 7 modules in under 30 seconds</p>

                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="error-banner">
                        <Lock size={14} /> {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={onSubmit}>
                    <div className="field" style={{ marginBottom: 14 }}>
                      <label>Full name</label>
                      <div className="input-wrap">
                        <input required autoComplete="name" value={name}
                          onChange={(e) => setName(e.target.value)} placeholder="Asha Menon"
                          style={{ paddingLeft: 42 }} />
                        <User size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                      </div>
                    </div>

                    <div className="field" style={{ marginBottom: 14 }}>
                      <label>Email address</label>
                      <div className="input-wrap">
                        <input type="email" required autoComplete="email" value={email}
                          onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                          style={{ paddingLeft: 42 }} />
                        <Mail size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                      </div>
                    </div>

                    <div className="field" style={{ marginBottom: 24 }}>
                      <label>Password <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(min 6 chars)</span></label>
                      <div className="input-wrap">
                        <input type={showPass ? "text" : "password"} required minLength={6}
                          autoComplete="new-password" value={password}
                          onChange={(e) => setPassword(e.target.value)} placeholder="Create a password"
                          style={{ paddingLeft: 42, paddingRight: 42 }} />
                        <Lock size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                        <button type="button" onClick={() => setShowPass((v) => !v)}
                          style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 0, display: "flex" }}>
                          {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>

                      {/* Password strength bar */}
                      {password && (
                        <div style={{ marginTop: 6 }}>
                          <div style={{ display: "flex", gap: 4 }}>
                            {[1, 2, 3, 4].map((i) => {
                              const strength = Math.min(4, Math.floor(password.length / 3));
                              const colors = ["var(--coral)", "var(--amber)", "var(--gold)", "var(--teal)"];
                              return (
                                <div key={i} style={{
                                  flex: 1, height: 3, borderRadius: 2,
                                  background: i <= strength ? colors[strength - 1] : "var(--bg-overlay)",
                                  transition: "background 0.3s",
                                }} />
                              );
                            })}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>
                            {password.length < 3 ? "Too short" : password.length < 6 ? "Weak" : password.length < 9 ? "Good" : password.length < 12 ? "Strong" : "Very strong"}
                          </div>
                        </div>
                      )}
                    </div>

                    <motion.button
                      type="submit" disabled={loading}
                      className="btn btn-teal btn-block btn-lg"
                      whileHover={{ scale: loading ? 1 : 1.01 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                    >
                      {loading ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="spin">
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                      ) : <UserPlus size={17} />}
                      {loading ? "Creating account…" : "Create free account"}
                    </motion.button>

                    <p style={{ fontSize: 11, color: "var(--text-disabled)", textAlign: "center", marginTop: 14, lineHeight: 1.5 }}>
                      By signing up you agree this is a portfolio demo project. No real banking services.
                    </p>
                  </form>

                  <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-muted)" }}>
                    Already have an account?{" "}
                    <Link to="/login" style={{ color: "var(--gold)", fontWeight: 600 }}>Sign in →</Link>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: "center", padding: "32px 0" }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    style={{
                      width: 72, height: 72, borderRadius: "50%", margin: "0 auto 20px",
                      background: "var(--teal-glow)", border: "2px solid var(--teal)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <ShieldCheck size={36} color="var(--teal)" />
                  </motion.div>
                  <h2 style={{ fontSize: 22, marginBottom: 8 }}>Account created!</h2>
                  <p>Your ₹25,000 wallet is ready. Redirecting to dashboard…</p>
                  <div style={{ marginTop: 20 }}>
                    <div className="skeleton" style={{ height: 4, borderRadius: 4 }}>
                      <motion.div style={{ height: "100%", background: "var(--teal)", borderRadius: 4 }}
                        initial={{ width: "0%" }} animate={{ width: "100%" }}
                        transition={{ duration: 1.5, ease: "easeInOut" }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
