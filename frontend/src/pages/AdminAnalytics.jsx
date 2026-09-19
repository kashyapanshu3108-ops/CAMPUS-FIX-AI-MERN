import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import Spinner from "../components/Spinner";
import api, { getErrorMessage } from "../services/api";

function BarList({ data, labelKey = "_id", max }) {
  const maxCount = max || Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="bar-list">
      {data.map((d) => (
        <div key={d[labelKey] || "unknown"} className="bar-row">
          <span className="bar-label">{d[labelKey] || "Unspecified"}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(d.count / maxCount) * 100}%` }} />
          </div>
          <span className="bar-count">{d.count}</span>
        </div>
      ))}
      {data.length === 0 && <p className="muted small">No data yet.</p>}
    </div>
  );
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/analytics")
      .then((res) => setAnalytics(res.data.analytics))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout title="Analytics"><Spinner label="Loading analytics..." /></DashboardLayout>;
  if (error) return <DashboardLayout title="Analytics"><div className="alert alert-error">{error}</div></DashboardLayout>;

  return (
    <DashboardLayout title="Analytics">
      <div className="cards-row">
        <div className="stat-card"><span className="stat-label">Avg. Priority</span><span className="stat-value">{analytics.avgPriority}</span></div>
        <div className="stat-card">
          <span className="stat-label">Avg. Resolution Time</span>
          <span className="stat-value">{analytics.avgResolutionHours !== null ? `${analytics.avgResolutionHours}h` : "—"}</span>
        </div>
        <div className="stat-card"><span className="stat-label">Top Category</span><span className="stat-value stat-value-sm">{analytics.topCategory || "—"}</span></div>
        <div className="stat-card"><span className="stat-label">Top Department</span><span className="stat-value stat-value-sm">{analytics.topDepartment || "—"}</span></div>
      </div>

      <div className="analytics-grid">
        <div className="card-panel">
          <h3>Issues by Category</h3>
          <BarList data={analytics.byCategory} />
        </div>
        <div className="card-panel">
          <h3>Issues by Status</h3>
          <BarList data={analytics.byStatus} />
        </div>
        <div className="card-panel">
          <h3>Issues by Department</h3>
          <BarList data={analytics.byDepartment} />
        </div>
        <div className="card-panel">
          <h3>Top Locations</h3>
          <BarList data={analytics.byLocation} />
        </div>
      </div>
    </DashboardLayout>
  );
}
