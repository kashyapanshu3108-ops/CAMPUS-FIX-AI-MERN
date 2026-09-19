const SEVERITY_STYLES = {
  Low: { bg: "#dcfce7", color: "#15803d" },
  Medium: { bg: "#fef3c7", color: "#b45309" },
  High: { bg: "#ffedd5", color: "#c2410c" },
  Critical: { bg: "#fee2e2", color: "#b91c1c" },
};

export default function SeverityBadge({ severity }) {
  const style = SEVERITY_STYLES[severity] || { bg: "#f1f5f9", color: "#475569" };
  return (
    <span className="badge" style={{ background: style.bg, color: style.color }}>
      {severity}
    </span>
  );
}
