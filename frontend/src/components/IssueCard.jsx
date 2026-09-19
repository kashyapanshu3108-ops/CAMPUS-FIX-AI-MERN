import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

export default function IssueCard({ issue }) {
  const navigate = useNavigate();
  return (
    <div className="issue-card" onClick={() => navigate(`/issues/${issue._id}`)}>
      <div className="issue-card-top">
        <h3>{issue.title}</h3>
        <StatusBadge status={issue.status} />
      </div>
      <p className="muted issue-card-desc">{issue.description}</p>
      <div className="issue-card-meta">
        <span>📍 {issue.location}</span>
        <span>🏷️ {issue.category}</span>
        {issue.department && <span>🏢 {issue.department}</span>}
      </div>
      <div className="issue-card-bottom">
        <PriorityBadge priority={issue.priority} />
        {issue.duplicateOf && <span className="badge badge-dup">🔗 Linked report</span>}
        {issue.duplicateCount > 1 && (
          <span className="badge badge-dup">👥 {issue.duplicateCount} students affected</span>
        )}
        <span className="muted small">{new Date(issue.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
