function polar(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}
function toAngle(v) { return 180 - (Math.max(0, Math.min(100, v)) / 100) * 180; }
function arc(cx, cy, r, v0, v1) {
  const p1 = polar(cx, cy, r, toAngle(v0));
  const p2 = polar(cx, cy, r, toAngle(v1));
  return `M${p1.x},${p1.y} A${r},${r} 0 0 1 ${p2.x},${p2.y}`;
}

export default function TrustRadar({ value = 0, displayValue = "", title = "", sublabel = "", accent = "var(--teal)", size = 220 }) {
  const cx = 110, cy = 115, r = 85;
  const needlePt = polar(cx, cy, r - 18, toAngle(value));
  const id = `gr-${title.replace(/\s/g, "")}`;

  return (
    <div style={{ width: "100%", maxWidth: size, margin: "0 auto", textAlign: "center" }}>
      <svg viewBox="0 0 220 148" width="100%" role="img" aria-label={`${title}: ${displayValue}`}>
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--coral)" />
            <stop offset="50%" stopColor="var(--amber)" />
            <stop offset="100%" stopColor="var(--teal)" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <path d={arc(cx, cy, r, 0, 100)} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="14" strokeLinecap="round" />

        {/* Gradient fill track (full arc, clipped by value) */}
        <path d={arc(cx, cy, r, 0, 100)} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="14" />
        <path d={arc(cx, cy, r, 0, value)} fill="none" stroke={`url(#${id})`} strokeWidth="14" strokeLinecap="round" />

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((t) => {
          const p1 = polar(cx, cy, r + 8, toAngle(t));
          const p2 = polar(cx, cy, r + 16, toAngle(t));
          return <line key={t} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />;
        })}

        {/* Risk zone labels */}
        <text x="22" y="130" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--coral)" letterSpacing="0.04em">HIGH</text>
        <text x="110" y="38" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--amber)" letterSpacing="0.04em">MED</text>
        <text x="198" y="130" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--teal)" letterSpacing="0.04em">LOW</text>

        {/* Needle */}
        <line x1={cx} y1={cy} x2={needlePt.x} y2={needlePt.y}
          stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="6" fill={accent} />
        <circle cx={cx} cy={cy} r="3" fill="var(--bg-base)" />

        {/* Center labels */}
        <text x={cx} y={cy - 12} textAnchor="middle"
          fontFamily="var(--font-mono)" fontSize="10" fill="var(--text-muted)" letterSpacing="0.08em">
          {title.toUpperCase()}
        </text>
        <text x={cx} y={cy + 22} textAnchor="middle"
          fontFamily="var(--font-display)" fontSize="32" fontWeight="700" fill="var(--text-primary)">
          {displayValue}
        </text>
      </svg>
      {sublabel && (
        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: -4 }}>{sublabel}</div>
      )}
    </div>
  );
}
