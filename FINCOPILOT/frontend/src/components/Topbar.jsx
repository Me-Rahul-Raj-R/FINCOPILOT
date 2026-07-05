import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell, ChevronDown, LogOut, User, Settings, Menu } from "lucide-react";
import { useAuth } from "../lib/AuthContext.jsx";

const TITLES = {
  "/":               "Dashboard",
  "/credit-risk":    "Credit Risk Engine · CR-01",
  "/fraud-shield":   "Fraud Shield · FR-02",
  "/kyc-vault":      "KYC Vault · KY-03",
  "/climate-ledger": "Climate Ledger · CL-04",
  "/cyber-watch":    "Cyber Watch · SE-05",
  "/pay":            "Pay · PY-07",
  "/assistant":      "AI Assistant · AI-06",
  "/admin":          "Admin Panel",
};

function greeting() {
  const h = new Date().getHours();
  if (h < 5)  return "Burning midnight oil";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "U";
}

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="icon-btn mobile-menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={16} />
        </button>
        <div>
          <div className="topbar-greeting">
            {greeting()}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </div>
          <div className="topbar-title">{TITLES[location.pathname] || "FinCopilot"}</div>
        </div>
      </div>

      <div className="topbar-right">
        {/* Notification bell */}
        <button className="icon-btn" title="No new alerts in this demo">
          <Bell size={15} />
          <span className="notif-dot" />
        </button>

        {/* User menu */}
        <div style={{ position: "relative" }} ref={ref}>
          <button className="user-pill" onClick={() => setMenuOpen((v) => !v)}>
            <div className="user-pill-avatar">{initials(user?.name)}</div>
            <span className="user-pill-name">{user?.name?.split(" ")[0] || "User"}</span>
            <ChevronDown size={12} color="var(--text-muted)"
              style={{ transform: menuOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>

          {menuOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <div className="dropdown-name">{user?.name}</div>
                <div className="dropdown-email">{user?.email}</div>
                <div style={{ marginTop: 6 }}>
                  <span className={`badge badge-${user?.role === "admin" ? "admin" : "user"}`}>
                    {user?.role}
                  </span>
                </div>
              </div>
              <button className="dropdown-item" onClick={() => setMenuOpen(false)}>
                <User size={14} color="var(--text-muted)" /> Profile
              </button>
              <button className="dropdown-item" onClick={() => setMenuOpen(false)}>
                <Settings size={14} color="var(--text-muted)" /> Settings
              </button>
              <div style={{ height: 1, background: "var(--border-soft)", margin: "6px 0" }} />
              <button className="dropdown-item danger" onClick={logout}>
                <LogOut size={14} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
