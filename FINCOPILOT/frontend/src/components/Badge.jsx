const MAP = {
  low:"low", allow:"allow", approved:"approved", done:"done", success:"done",
  medium:"medium", stepupauth:"stepup", stepuprequired:"stepup",
  manualreview:"review", inprogress:"progress", progress:"progress",
  high:"high", block:"block", blocked:"blocked", holdforreview:"hold",
  rejected:"rejected", pending:"pending", notstarted:"pending",
  admin:"admin", user:"user",
};
function norm(v) { return (v ?? "").toString().toLowerCase().replace(/[^a-z0-9]/g, ""); }

export default function Badge({ children, tone }) {
  const bucket = MAP[norm(tone ?? children)];
  return <span className={`badge badge-${bucket || "neutral"}`}>{children}</span>;
}
