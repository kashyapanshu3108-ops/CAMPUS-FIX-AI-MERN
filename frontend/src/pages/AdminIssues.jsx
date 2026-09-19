import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import IssueCard from "../components/IssueCard";
import Spinner from "../components/Spinner";
import api, { getErrorMessage } from "../services/api";

const STATUSES = ["Reported", "AI Analyzed", "Assigned", "In Progress", "Resolved"];
const CATEGORIES = ["Water", "Electrical", "WiFi", "Cleanliness", "Hostel", "Classroom", "Furniture", "Security", "Road & Infrastructure", "Other"];
const SEVERITIES = ["Low", "Medium", "High", "Critical"];

export default function AdminIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (status) params.status = status;
    if (category) params.category = category;
    if (severity) params.severity = severity;
    if (sort) params.sort = sort;

    const timeout = setTimeout(() => {
      api
        .get("/issues", { params })
        .then((res) => setIssues(res.data.issues))
        .catch((err) => setError(getErrorMessage(err)))
        .finally(() => setLoading(false));
    }, 300); // small debounce for search typing

    return () => clearTimeout(timeout);
  }, [search, status, category, severity, sort]);

  return (
    <DashboardLayout title="All Issues">
      <div className="toolbar toolbar-wrap">
        <input
          className="search-input"
          placeholder="Search title, description, location, department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="">All Severities</option>
          {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="priority_high">Highest priority</option>
          <option value="priority_low">Lowest priority</option>
        </select>
      </div>

      <p className="muted small">{issues.length} issue{issues.length === 1 ? "" : "s"} found</p>

      {loading && <Spinner label="Loading issues..." />}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && issues.length === 0 && (
        <div className="empty-state"><p>No issues match your filters.</p></div>
      )}

      <div className="issue-grid">
        {issues.map((issue) => <IssueCard key={issue._id} issue={issue} />)}
      </div>
    </DashboardLayout>
  );
}
