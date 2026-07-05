import AnimatedNumber from "./AnimatedNumber.jsx";
import Sparkline from "./Sparkline.jsx";

const GLOWS = {
  "var(--teal)":  "rgba(56,217,200,0.30)",
  "var(--gold)":  "rgba(232,184,75,0.30)",
  "var(--coral)": "rgba(240,82,82,0.30)",
  "var(--amber)": "rgba(245,158,11,0.30)",
  "var(--violet)":"rgba(139,92,246,0.30)",
};

export default function StatTile({ label, value, foot, trend, accent = "var(--teal)", formatter, icon: Icon }) {
  const isNum = typeof value === "number";
  const glowColor = GLOWS[accent] || "rgba(56,217,200,0.2)";

  return (
    <div className="stat-tile" style={{ position: "relative", overflow: "hidden" }}>
      {/* Glow in corner */}
      <div className="stat-tile-glow" style={{ background: glowColor }} />

      <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
        <div className="stat-label">{label}</div>
        {Icon && <Icon size={15} color={accent} style={{ opacity: 0.7 }} />}
      </div>

      <div className="stat-value" style={{ color: accent }}>
        {isNum ? <AnimatedNumber value={value} formatter={formatter} /> : (value ?? "—")}
      </div>

      <div className="flex items-center justify-between" style={{ marginTop: 8, minHeight: 30 }}>
        {foot && <div className="stat-foot">{foot}</div>}
        {trend && trend.length > 1 && <Sparkline data={trend} color={accent} />}
      </div>
    </div>
  );
}
