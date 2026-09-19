import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import IssueCard from "../components/IssueCard";
import Spinner from "../components/Spinner";
import api, { getErrorMessage } from "../services/api";

const FILTERS = ["All", "Reported", "AI Analyzed", "Assigned", "In Progress", "Resolved"];

export default function MyReports() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  // Rating System State
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);

  useEffect(() => {
    setLoading(true);
    api
      .get("/issues/my", { params: { status: filter } })
      .then((res) => setIssues(res.data.issues))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [filter]);

  const filtered = issues.filter((i) =>
    `${i.title} ${i.location} ${i.category}`.toLowerCase().includes(search.toLowerCase())
  );

  const openRatingModal = (issue) => {
    setSelectedIssue(issue);
    setSelectedStar(0);
    setRatingModalOpen(true);
  };

  const submitRating = () => {
    if (selectedStar === 0) {
      alert("Please select at least 1 star.");
      return;
    }
    // API Call simulate kar rahe hain
    setTimeout(() => {
      alert(`Thank you! You rated "${selectedIssue.title}" ${selectedStar} stars.`);
      setRatingModalOpen(false);
    }, 500);
  };

  return (
    <DashboardLayout title="My Reports">
      <div className="toolbar" style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
        <input
          className="search-input"
          placeholder="Search your reports..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", width: "300px" }}
        />
        <div className="filter-pills" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              style={{
                padding: "8px 16px", borderRadius: "20px", border: "none", cursor: "pointer", fontWeight: "bold",
                background: filter === f ? "#4f46e5" : "#e5e7eb",
                color: filter === f ? "white" : "#374151"
              }}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading && <Spinner label="Loading your reports..." />}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="empty-state" style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}><p>No reports match this filter.</p></div>
      )}

      <div className="issue-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {filtered.map((issue) => (
          <div key={issue._id} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <IssueCard issue={issue} />
            
            {/* Show Rating button only if issue is resolved */}
            {issue.status === "Resolved" && (
              <button 
                onClick={() => openRatingModal(issue)}
                style={{ padding: "10px", background: "#fef08a", color: "#854d0e", border: "1px solid #fde047", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
              >
                ⭐ Rate Resolution
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Rating Modal */}
      {ratingModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", maxWidth: "400px", width: "90%", textAlign: "center", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h2 style={{ marginTop: 0, color: "#111827" }}>Rate Maintenance Work</h2>
            <p style={{ color: "#6b7280", marginBottom: "20px" }}>How satisfied are you with the resolution of <strong>"{selectedIssue?.title}"</strong>?</p>
            
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "25px", fontSize: "40px", cursor: "pointer" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setSelectedStar(star)}
                  style={{ color: star <= (hoveredStar || selectedStar) ? "#fbbf24" : "#e5e7eb", transition: "color 0.2s" }}
                >
                  ★
                </span>
              ))}
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button onClick={() => setRatingModalOpen(false)} style={{ padding: "10px 20px", border: "1px solid #d1d5db", background: "white", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                Cancel
              </button>
              <button onClick={submitRating} style={{ padding: "10px 20px", border: "none", background: "#4f46e5", color: "white", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}abb styli
    </DashboardLayout>
  );
}