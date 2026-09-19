import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import IssueCard from "../components/IssueCard";
import Spinner from "../components/Spinner";
import api, { getErrorMessage } from "../services/api";

// Nayi libraries import ki hain
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [urgent, setUrgent] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  
  const navigate = useNavigate();
  // PDF banane ke liye dashboard content ka reference
  const reportRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get("/admin/stats"),
      api.get("/issues", { params: { sort: "newest" } }),
      api.get("/admin/analytics"),
    ])
      .then(([statsRes, issuesRes, analyticsRes]) => {
        setStats(statsRes.data.stats);
        setRecent(issuesRes.data.issues.slice(0, 6));
        setUrgent(issuesRes.data.issues.filter((i) => i.priority >= 8 && i.status !== "Resolved").slice(0, 4));
        setInsights(analyticsRes.data.analytics.insights);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  // PDF Download karne ka Function
  const downloadPDF = () => {
    setIsDownloading(true);
    const element = reportRef.current;
    
    html2canvas(element, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
      pdf.save(`CampusFix_Report_${new Date().toLocaleDateString()}.pdf`);
      setIsDownloading(false);
    }).catch(err => {
      console.error("Error generating PDF", err);
      setIsDownloading(false);
    });
  };

  if (loading) return <DashboardLayout title="Admin Dashboard"><Spinner label="Loading dashboard..." /></DashboardLayout>;
  if (error) return <DashboardLayout title="Admin Dashboard"><div className="alert alert-error">{error}</div></DashboardLayout>;

  return (
    <DashboardLayout title="Admin Dashboard">
      
      {/* Top Section with Download Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "15px" }}>
        <div>
          <h2 style={{ margin: 0 }}>Overview of all campus issues</h2>
          <p className="muted" style={{ margin: "5px 0 0" }}>Live tracking and AI analytics</p>
        </div>
        <button 
          onClick={downloadPDF} 
          disabled={isDownloading}
          style={{ 
            padding: "10px 18px", background: isDownloading ? "#9ca3af" : "#4f46e5", color: "white", 
            border: "none", borderRadius: "8px", cursor: isDownloading ? "not-allowed" : "pointer", 
            fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px",
            boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)"
          }}
        >
          {isDownloading ? "⏳ Generating PDF..." : "📥 Download PDF Report"}
        </button>
      </div>

      {/* Jisko PDF me convert karna hai uspe ref lagaya hai */}
      <div ref={reportRef} style={{ background: "#f8fafc", padding: "10px" }}>
        
        {/* Stats Row 1 */}
        <div className="cards-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "15px" }}>
          <div className="stat-card">
            <span className="stat-label">Total Issues</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{stats.pending}</span>
          </div>
          <div className="stat-card stat-urgent" style={{ borderLeft: "4px solid #ef4444" }}>
            <span className="stat-label">Urgent</span>
            <span className="stat-value">{stats.urgent}</span>
          </div>
          <div className="stat-card" style={{ borderLeft: "4px solid #10b981" }}>
            <span className="stat-label">Resolved</span>
            <span className="stat-value">{stats.resolved}</span>
          </div>
        </div>

        {/* Stats Row 2 */}
        <div className="cards-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "25px" }}>
          <div className="stat-card">
            <span className="stat-label">AI Analyzed</span>
            <span className="stat-value">{stats.aiAnalyzed}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Duplicate Issues</span>
            <span className="stat-value">{stats.duplicates}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">In Progress</span>
            <span className="stat-value">{stats.inProgress}</span>
          </div>
        </div>

        {/* AI Insights Panel */}
        {insights.length > 0 && (
          <div className="card-panel insights-panel" style={{ background: "#eef2ff", border: "1px solid #c7d2fe", marginBottom: "30px" }}>
            <h3 style={{ margin: "0 0 15px 0", color: "#3730a3", display: "flex", alignItems: "center", gap: "10px" }}>
              💡 AI Insights
            </h3>
            <ul style={{ margin: 0, paddingLeft: "20px", color: "#374151", lineHeight: "1.6" }}>
              {insights.map((line, idx) => <li key={idx} style={{ marginBottom: "8px" }}>{line}</li>)}
            </ul>
          </div>
        )}

        {/* Urgent Issues Grid */}
        {urgent.length > 0 && (
          <div style={{ marginBottom: "30px" }}>
            <div className="section-header" style={{ marginBottom: "15px" }}>
              <h2 style={{ color: "#dc2626", margin: 0 }}>🚨 Urgent Issues</h2>
            </div>
            <div className="issue-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "15px" }}>
              {urgent.map((issue) => <IssueCard key={issue._id} issue={issue} />)}
            </div>
          </div>
        )}

        {/* Recent Issues Grid */}
        <div>
          <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h2 style={{ margin: 0 }}>Recent Issues</h2>
            <button className="btn btn-ghost" onClick={() => navigate("/admin/issues")} style={{ padding: "6px 12px", fontSize: "14px" }}>
              View all →
            </button>
          </div>
          <div className="issue-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "15px" }}>
            {recent.map((issue) => <IssueCard key={issue._id} issue={issue} />)}
          </div>
        </div>

      </div> {/* PDF Content End */}

    </DashboardLayout>
  );
}