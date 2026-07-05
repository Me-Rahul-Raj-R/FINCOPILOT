export default function Card({ title, subtitle, right, children, style, className = "", variant = "" }) {
  const cls = ["card", variant && `card-${variant}`, className].filter(Boolean).join(" ");
  return (
    <div className={cls} style={style}>
      {(title || right) && (
        <div className="card-head">
          <div>
            {title && <div className="card-title">{title}</div>}
            {subtitle && <div className="card-sub">{subtitle}</div>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}
