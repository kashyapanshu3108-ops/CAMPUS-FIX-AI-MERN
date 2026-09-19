const STATUS_STYLES = {
  Reported: { bg: "#e0e7ff", color: "#4338ca" },
  "AI Analyzed": { bg: "#ede9fe", color: "#6d28d9" },
  Assigned: { bg: "#fef3c7", color: "#b45309" },
  "In Progress": { bg: "#dbeafe", color: "#1d4ed8" },
  Resolved: { bg: "#dcfce7", color: "#15803d" },
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || { bg: "#f1f5f9", color: "#475569" };
  return (
    <span className="badge" style={{ background: style.bg, color: style.color }}>
      {status}
    </span>
  );
}
