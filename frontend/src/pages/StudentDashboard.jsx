import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import IssueCard from "../components/IssueCard";
import Spinner from "../components/Spinner";
import api, { getErrorMessage } from "../services/api";

export default function StudentDashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/issues/my")
      .then((res) => setIssues(res.data.issues))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const total = issues.length;
  const pending = issues.filter((i) => i.status !== "Resolved").length;
  const inProgress = issues.filter((i) => i.status === "In Progress").length;
  const resolved = issues.filter((i) => i.status === "Resolved").length;

  return (
    <DashboardLayout title="Dashboard">
      <div className="cards-row">
        <div className="stat-card">
          <span className="stat-label">Total Reports</span>
          <span className="stat-value">{total}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending</span>
          <span className="stat-value">{pending}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">In Progress</span>
          <span className="stat-value">{inProgress}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Resolved</span>
          <span className="stat-value">{resolved}</span>
        </div>
      </div>

      <div className="section-header">
        <h2>Recent Reports</h2>
        <button className="btn btn-primary" onClick={() => navigate("/report")}>+ Report Issue</button>
      </div>

      {loading && <Spinner label="Loading reports..." />}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && issues.length === 0 && (
        <div className="empty-state">
          <p>You haven't reported any issues yet.</p>
          <button className="btn btn-primary" onClick={() => navigate("/report")}>Report your first issue</button>
        </div>
      )}

      <div className="issue-grid">
        {issues.slice(0, 6).map((issue) => (
          <IssueCard key={issue._id} issue={issue} />
        ))}
      </div>
    </DashboardLayout>
  );
}
