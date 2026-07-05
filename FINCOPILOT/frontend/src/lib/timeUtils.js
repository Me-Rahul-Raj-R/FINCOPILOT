export function timeAgo(dateInput) {
  const date = new Date(dateInput);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

/** Buckets a list of { createdAt } records into a 7-day daily count trend, oldest first. */
export function dailyCountTrend(records = [], days = 7) {
  const buckets = Array.from({ length: days }, () => 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (const r of records) {
    const d = new Date(r.createdAt);
    d.setHours(0, 0, 0, 0);
    const diffDays = Math.round((now - d) / 86400000);
    const idx = days - 1 - diffDays;
    if (idx >= 0 && idx < days) buckets[idx] += 1;
  }
  return buckets;
}
