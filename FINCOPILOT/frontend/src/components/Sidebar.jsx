import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutGrid, ShieldCheck, Radar, ScanFace, Leaf,
  Lock, Bot, Wallet, ShieldAlert, X, Sparkles,
} from "lucide-react";
import { useAuth } from "../lib/AuthContext.jsx";
import { api } from "../lib/api.js";

const NAV_MAIN = [
  { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/credit-risk", label: "Credit Risk", code: "CR-01", icon: ShieldCheck },
  { to: "/fraud-shield", label: "Fraud Shield", code: "FR-02", icon: Radar },
  { to: "/kyc-vault", label: "KYC Vault", code: "KY-03", icon: ScanFace },
  { to: "/climate-ledger", label: "Climate Ledger", code: "CL-04", icon: Leaf },
  { to: "/cyber-watch", label: "Cyber Watch", code: "SE-05", icon: Lock },
  { to: "/pay", label: "Pay", code: "PY-07", icon: Wallet },
  { to: "/assistant", label: "AI Assistant", code: "AI-06", icon: Bot },
  { to: "/solver-hub", label: "Problem Solver", code: "SL-08", icon: Sparkles },
];

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "?";
}

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, isAdmin } = useAuth();
  const [dbMode, setDbMode] = useState("DEMO");

  useEffect(() => {
    api.health()
      .then((res) => {
        if (res.mode) {
          setDbMode(res.mode);
        }
      })
      .catch(() => {
        setDbMode("DEMO");
      });
  }, []);

  return (
    <aside className={`sidebar${mobileOpen ? " open" : ""}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-logo-wrap">
          <svg width="36" height="36" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="14" fill="#0d1729" />
            <path d="M32 10 L50 18 V32 C50 44 42 52 32 56 C22 52 14 44 14 32 V18 Z"
              fill="none" stroke="#e8b84b" strokeWidth="2.5" />
            <path d="M24 33 L29 38 L40 26"
              fill="none" stroke="#38d9c8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="brand-text-primary">FinCopilot</div>
          <div className="brand-text-sub">Risk · Assist · Payments</div>
        </div>
        <button className="icon-btn mobile-menu-btn" onClick={onClose} aria-label="Close menu"
          style={{ width: 28, height: 28 }}>
          <X size={14} />
        </button>
      </div>

      {/* User chip */}
      {user && (
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials(user.name)}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-role">{user.role}</div>
          </div>
        </div>
      )}

      {/* Nav */}
      <div className="nav-section-label">Modules</div>
      <ul className="nav-list">
        {NAV_MAIN.map(({ to, label, code, icon: Icon, end }) => (
          <li key={to}>
            <NavLink to={to} end={end}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              {({ isActive }) => (
                <>
                  <span className="nav-icon-wrap">
                    <Icon size={16} strokeWidth={isActive ? 2 : 1.7}
                      color={isActive ? "var(--gold)" : "var(--text-muted)"} />
                  </span>
                  <span style={{ flex: 1 }}>{label}</span>
                  {code && <span className="nav-code">{code}</span>}
                  {isActive && (
                    <motion.div layoutId="nav-indicator"
                      style={{
                        position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
                        background: "linear-gradient(180deg, var(--gold), var(--teal))",
                        borderRadius: "0 3px 3px 0",
                      }}
                    />
                  )}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      {isAdmin && (
        <>
          <div className="nav-section-label">Administration</div>
          <ul className="nav-list">
            <li>
              <NavLink to="/admin" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
                {({ isActive }) => (
                  <>
                    <span className="nav-icon-wrap">
                      <ShieldAlert size={16} strokeWidth={isActive ? 2 : 1.7}
                        color={isActive ? "var(--gold)" : "var(--text-muted)"} />
                    </span>
                    <span style={{ flex: 1 }}>Admin Panel</span>
                    <span className="nav-code" style={isActive ? { background: "var(--gold-glow)", color: "var(--gold)" } : {}}>ADM</span>
                  </>
                )}
              </NavLink>
            </li>
          </ul>
        </>
      )}

      {/* Footer */}
      <div className="sidebar-footer">
        <div className={`mode-badge ${dbMode === "PERSISTENT" ? "persistent" : "demo"}`}>
          <span className="mode-dot" />
          {dbMode === "PERSISTENT" ? "Persistent Mode" : "Demo Mode"}
        </div>
        <div style={{ fontSize: 10, lineHeight: 1.5, marginTop: 4 }}>
          {dbMode === "PERSISTENT"
            ? "Live database connection. All transactions and audits are permanently recorded in MySQL."
            : "Synthetic data & simulated models. Real algorithms, real database."}
        </div>
      </div>
    </aside>
  );
}
