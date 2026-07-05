import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck, Radar, ScanFace, Leaf, Lock, Bot,
  Wallet, ArrowRight, Activity, Send, FileText, ScanLine, Sparkles,
} from "lucide-react";
import Card from "../components/Card.jsx";
import StatTile from "../components/StatTile.jsx";
import Badge from "../components/Badge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { timeAgo, dailyCountTrend } from "../lib/timeUtils.js";

const MODULES = [
  { to: "/credit-risk", code: "CR-01", icon: ShieldCheck, title: "Credit Risk Engine", problem: "NPAs & financial exclusion", desc: "Bureau + alternative-data scoring with explainability", accent: "var(--teal)" },
  { to: "/fraud-shield", code: "FR-02", icon: Radar, title: "Fraud Shield", problem: "Mule accounts, scams & AML", desc: "4-signal detection: z-score, velocity, fan-out, structuring", accent: "var(--coral)" },
  { to: "/kyc-vault", code: "KY-03", icon: ScanFace, title: "KYC Vault", problem: "Deepfake & synthetic identity", desc: "Layered onboarding + cross-record identity linkage", accent: "var(--gold)" },
  { to: "/climate-ledger", code: "CL-04", icon: Leaf, title: "Climate Ledger", problem: "Climate risk in long-term lending", desc: "Industry × hazard × tenure risk scoring", accent: "var(--teal)" },
  { to: "/cyber-watch", code: "SE-05", icon: Lock, title: "Cyber Watch", problem: "Cybersecurity & Q-Day", desc: "Security posture + PQC migration checklist", accent: "var(--violet)" },
  { to: "/pay", code: "PY-07", icon: Wallet, title: "Pay", problem: "Fintech payment UX", desc: "GPay-style wallet routed through Fraud Shield live", accent: "var(--gold)" },
  { to: "/assistant", code: "AI-06", icon: Bot, title: "AI Assistant", problem: "12 unsolved banking problems", desc: "Real RAG pipeline with TF-IDF retrieval + source citations", accent: "var(--violet)" },
];

const QUICK = [
  { to: "/credit-risk", icon: FileText, label: "Score applicant", color: "var(--teal)" },
  { to: "/fraud-shield", icon: ScanLine, label: "Check transaction", color: "var(--coral)" },
  { to: "/pay", icon: Send, label: "Send money", color: "var(--gold)" },
];

function ActivityIcon({ type }) {
  const icons = { credit: ShieldCheck, fraud: Radar, kyc: ScanFace, climate: Leaf, wallet: Wallet };
  const I = icons[type] || Activity;
  return <I size={13} />;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [trends, setTrends] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboardSummary().then(setStats).catch(() => {});
    Promise.all([
      api.listCreditApplications().catch(() => []),
      api.listTransactions().catch(() => []),
      api.listKyc().catch(() => []),
      api.listClimate().catch(() => []),
      api.getWallet().catch(() => null),
    ]).then(([credit, fraud, kyc, climate, wallet]) => {
      setTrends({
        credit: dailyCountTrend(credit),
        fraud: dailyCountTrend(fraud),
        kyc: dailyCountTrend(kyc),
        climate: dailyCountTrend(climate),
      });
      const all = [
        ...credit.slice(0, 4).map(r => ({ type: "credit", id: `c${r.id}`, createdAt: r.createdAt, title: `Scored ${r.applicantName}`, tag: r.riskCategory, sub: `Score ${r.riskScore} · ${r.decision}` })),
        ...fraud.slice(0, 4).map(r => ({ type: "fraud", id: `f${r.id}`, createdAt: r.createdAt, title: `${r.senderAccount} → ${r.receiverAccount}`, tag: r.decision, sub: `₹${Number(r.amount).toLocaleString("en-IN")} · risk ${r.fraudRiskScore}` })),
        ...kyc.slice(0, 3).map(r => ({ type: "kyc", id: `k${r.id}`, createdAt: r.createdAt, title: `KYC · ${r.applicantName}`, tag: r.status, sub: `Liveness ${r.livenessConfidence}%` })),
        ...(wallet?.transactions ?? []).slice(0, 3).map(r => ({ type: "wallet", id: `w${r.id}`, createdAt: r.createdAt, title: `${r.type.replace(/_/g, " ")} · ${r.counterparty}`, tag: r.status, sub: `₹${Number(r.amount).toLocaleString("en-IN")}` })),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
      setActivity(all);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: "relative", overflow: "hidden",
          background: "linear-gradient(135deg, var(--bg-elevated), var(--bg-overlay) 60%)",
          border: "1px solid var(--border-strong)", borderRadius: "var(--r-lg)",
          padding: "28px 28px 24px", marginBottom: 22,
        }}
      >
        {/* Decorative glow */}
        <div aria-hidden style={{
          position: "absolute", top: -60, right: -40, width: 220, height: 220,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(232,184,75,0.15), transparent 70%)",
          pointerEvents: "none",
        }} />
        <div aria-hidden style={{
          position: "absolute", bottom: -40, left: -30, width: 160, height: 160,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(56,217,200,0.10), transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
          <Sparkles size={14} color="var(--gold)" />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)" }}>
            FinCopilot · AI Risk &amp; Payments Ledger
          </span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, maxWidth: 600 }}>
          {user ? `Welcome back, ${user.name.split(" ")[0]}.` : "Six banking risks."}
          <span className="gradient-text"> One ledger.</span>
        </h1>
        <p style={{ maxWidth: 580, marginBottom: 22, fontSize: 14 }}>
          Credit risk, fraud, KYC, climate, cyber, and payments unified behind one shared API and one
          fraud engine — with a real RAG assistant trained on 12 unsolved global banking problems.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {QUICK.map((q) => (
            <Link key={q.to} to={q.to}>
              <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }}
                style={{
                  display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500,
                  padding: "9px 16px", borderRadius: "var(--r-sm)",
                  background: `${q.color}15`, border: `1px solid ${q.color}30`, color: q.color,
                  transition: "all 0.2s",
                }}>
                <q.icon size={15} /> {q.label}
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h2 style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>Your activity</h2>
        {stats && <span className="tag-chip">{stats.scope === "ALL_USERS" ? "ALL USERS · ADMIN VIEW" : "YOUR ACCOUNT"}</span>}
      </div>
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: "Applications scored", value: stats?.totalLoans ?? 0, foot: `${stats?.highRiskLoans ?? 0} High risk`, accent: "var(--teal)", trend: trends.credit },
          { label: "Transactions monitored", value: stats?.totalTxns ?? 0, foot: `${stats?.blockedTxns ?? 0} blocked/held`, accent: "var(--coral)", trend: trends.fraud },
          { label: "KYC approval rate", value: stats?.kycApprovalRate ?? 0, formatter: v => `${v}%`, foot: `${stats?.totalKyc ?? 0} attempts`, accent: "var(--gold)", trend: trends.kyc },
          { label: "Climate assessments", value: stats?.climateAssessments ?? 0, foot: "Long-tenure scans", accent: "var(--violet)", trend: trends.climate },
        ].map((tile) => (
          <StatTile key={tile.label} {...tile} />
        ))}
      </div>

      <div className="two-col">
        {/* Module cards */}
        <div>
          <h2 style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 14 }}>Modules</h2>
          <div className="grid grid-3">
            {MODULES.map((m, i) => (
              <motion.div key={m.code}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
              >
                <Link to={m.to} style={{ display: "block", height: "100%" }}>
                  <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}
                    style={{
                      background: "var(--bg-elevated)", border: "1px solid var(--border-soft)",
                      borderRadius: "var(--r-md)", padding: "16px", height: "100%",
                      cursor: "pointer", transition: "all var(--t-base) var(--ease)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = m.accent + "55"; e.currentTarget.style.boxShadow = `0 0 20px ${m.accent}18`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-soft)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "var(--r-sm)", background: `${m.accent}18`, border: `1px solid ${m.accent}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <m.icon size={17} color={m.accent} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className="tag-chip" style={{ color: m.accent, borderColor: m.accent + "30", background: m.accent + "10" }}>{m.code}</span>
                        <ArrowRight size={14} color="var(--text-muted)" />
                      </div>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 3 }}>{m.title}</div>
                    <div style={{ fontSize: 11, color: m.accent, marginBottom: 6 }}>{m.problem}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>{m.desc}</div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <Card title="Recent activity" subtitle="Latest events across all modules"
          style={{ height: "fit-content", maxHeight: 520, display: "flex", flexDirection: "column" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton" style={{ height: 50 }} />)}
            </div>
          ) : activity.length === 0 ? (
            <EmptyState icon={Activity} title="No activity yet"
              sub="Score an applicant, check a transaction, or use Pay to see activity here." />
          ) : (
            <div style={{ overflowY: "auto" }}>
              {activity.map((a, i) => (
                <motion.div key={a.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "10px 0", borderBottom: i < activity.length - 1 ? "1px solid var(--border-soft)" : "none",
                  }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: "var(--r-sm)", flexShrink: 0,
                    background: "var(--bg-overlay)", border: "1px solid var(--border-soft)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--text-muted)",
                  }}>
                    <ActivityIcon type={a.type} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{a.sub}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {a.tag && <Badge tone={a.tag}>{String(a.tag).replace(/_/g, " ")}</Badge>}
                    <div style={{ fontSize: 10, color: "var(--text-disabled)", marginTop: 3 }}>{timeAgo(a.createdAt)}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
