export default function PriorityBadge({ priority }) {
  let color = "#15803d";
  let bg = "#dcfce7";
  if (priority >= 8) {
    color = "#b91c1c";
    bg = "#fee2e2";
  } else if (priority >= 5) {
    color = "#b45309";
    bg = "#fef3c7";
  }
  return (
    <span className="badge" style={{ background: bg, color }}>
      Priority {priority}/10
    </span>
  );
}
