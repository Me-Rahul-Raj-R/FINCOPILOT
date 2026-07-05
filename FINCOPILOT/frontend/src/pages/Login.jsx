import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Eye, EyeOff, ShieldCheck, User, Sparkles, Lock } from "lucide-react";
import { useAuth } from "../lib/AuthContext.jsx";
import { useToast } from "../lib/ToastContext.jsx";

const ROLES = [
  {
    key: "user",
    label: "User",
    icon: User,
    color: "var(--teal)",
    email: "demo@fincopilot.local",
    pass: "Demo@12345",
    desc: "Access your personal risk dashboard, wallet, and AI assistant",
  },
  {
    key: "admin",
    label: "Admin",
    icon: ShieldCheck,
    color: "var(--gold)",
    email: "admin@fincopilot.local",
    pass: "Admin@12345",
    desc: "Full platform overview, user management, and all-user analytics",
  },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [activeRole, setActiveRole] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function fillDemo(i) {
    setActiveRole(i);
    setEmail(ROLES[i].email);
    setPassword(ROLES[i].pass);
    setError("");
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back to FinCopilot!");
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  return (
    <div className="auth-shell">
      {/* Animated background spheres */}
      <div className="auth-sphere auth-sphere-1" />
      <div className="auth-sphere auth-sphere-2" />
      <div className="auth-sphere auth-sphere-3" />

      {/* Grid pattern overlay */}
      <div aria-hidden style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(56,217,200,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(56,217,200,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }} />

      <div style={{ width: "100%", maxWidth: 460, position: "relative", zIndex: 1 }}>
        {/* Logo + Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: 28 }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div className="auth-logo-ring">
              <svg width="36" height="36" viewBox="0 0 64 64">
                <rect width="64" height="64" rx="14" fill="#0d1729" />
                <path d="M32 10 L50 18 V32 C50 44 42 52 32 56 C22 52 14 44 14 32 V18 Z"
                  fill="none" stroke="#e8b84b" strokeWidth="2.5" />
                <path d="M24 33 L29 38 L40 26"
                  fill="none" stroke="#38d9c8" strokeWidth="3"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em" }}>
                Fin<span className="gradient-text">Copilot</span>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                AI Risk · Assist · Payments
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="auth-card"
        >
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h1 className="auth-heading">Sign in to your account</h1>
            <p className="auth-sub">Choose your role and enter your credentials</p>
          </div>

          {/* Role selector tabs */}
          <div style={{ marginBottom: 22 }}>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 0,
            }}>
              {ROLES.map((role, i) => {
                const Icon = role.icon;
                const isActive = activeRole === i;
                return (
                  <motion.button
                    key={role.key}
                    type="button"
                    onClick={() => fillDemo(i)}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      padding: "14px 12px",
                      borderRadius: "var(--r-md)",
                      border: `1px solid ${isActive ? role.color : "var(--border-soft)"}`,
                      background: isActive
                        ? `linear-gradient(135deg, ${role.color}18, ${role.color}08)`
                        : "var(--bg-overlay)",
                      cursor: "pointer", textAlign: "left",
                      transition: "all var(--t-base) var(--ease)",
                      boxShadow: isActive ? `0 0 20px ${role.color}22` : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <Icon size={16} color={isActive ? role.color : "var(--text-muted)"} />
                      <span style={{
                        fontWeight: 600, fontSize: 13,
                        color: isActive ? role.color : "var(--text-secondary)",
                      }}>{role.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="role-check"
                          style={{
                            marginLeft: "auto", width: 18, height: 18,
                            borderRadius: "50%", background: role.color,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10">
                            <path d="M2 5l2 2 4-4" stroke="#0d1729" strokeWidth="1.8"
                              fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </motion.div>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>
                      {role.desc}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Demo credentials hint */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRole}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{
                  marginTop: 10, padding: "10px 14px",
                  background: "var(--bg-overlay)", borderRadius: "var(--r-sm)",
                  border: "1px solid var(--border-soft)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <Sparkles size={12} color="var(--gold)" />
                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    Demo credentials auto-filled
                  </span>
                </div>
                <span style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                  {ROLES[activeRole].pass}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="error-banner"
              >
                <Lock size={14} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={onSubmit}>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>Email address</label>
              <div className="input-wrap">
                <input
                  type="email" required autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ paddingLeft: 42 }}
                />
                <User size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
              </div>
            </div>

            <div className="field" style={{ marginBottom: 24 }}>
              <label>Password</label>
              <div className="input-wrap">
                <input
                  type={showPass ? "text" : "password"} required
                  autoComplete="current-password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ paddingLeft: 42, paddingRight: 42 }}
                />
                <Lock size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                <button type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", padding: 0 }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="spin">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              ) : <LogIn size={17} />}
              {loading ? "Signing in…" : "Sign in"}
            </motion.button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-muted)" }}>
            No account?{" "}
            <Link to="/signup" style={{ color: "var(--teal)", fontWeight: 600 }}>
              Create one free →
            </Link>
          </p>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "var(--text-disabled)" }}
        >
          FinCopilot v2.1 · Portfolio Project · Built with React + Node.js + MySQL
        </motion.div>
      </div>
    </div>
  );
}
