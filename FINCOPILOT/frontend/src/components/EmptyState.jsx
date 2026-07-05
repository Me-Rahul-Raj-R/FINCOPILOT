export default function EmptyState({ icon: Icon, title, sub, action }) {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-state-icon">
          <Icon size={32} strokeWidth={1.4} color="var(--text-muted)" />
        </div>
      )}
      {title && <div className="empty-state-title">{title}</div>}
      {sub && <div className="empty-state-sub">{sub}</div>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}
