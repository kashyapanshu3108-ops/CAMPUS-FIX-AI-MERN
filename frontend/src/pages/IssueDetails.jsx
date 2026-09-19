import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import SeverityBadge from "../components/SeverityBadge";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import api, { getErrorMessage } from "../services/api";

const STATUS_FLOW = ["Reported", "AI Analyzed", "Assigned", "In Progress", "Resolved"];

export default function IssueDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [relatedReports, setRelatedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  // Chat System State (Dummy initial comment)
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([
    { id: 1, sender: "Maintenance Team", role: "maintenance", text: "We have received the request and will inspect it by evening.", time: "10:30 AM" }
  ]);

  const load = () => {
    setLoading(true);
    api
      .get(`/issues/${id}`)
      .then((res) => {
        setIssue(res.data.issue);
        setRelatedReports(res.data.relatedReports || []);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await api.patch(`/issues/${id}/status`, { status: newStatus });
      setIssue(res.data.issue);
      showToast(`Status updated to "${newStatus}".`, "success");
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const commentObj = {
      id: Date.now(),
      sender: user?.name || "Student",
      role: user?.role || "student",
      text: newComment,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setComments([...comments, commentObj]);
    setNewComment("");
  };

  if (loading) return <DashboardLayout title="Issue Details"><Spinner label="Loading issue..." /></DashboardLayout>;
  if (error) return <DashboardLayout title="Issue Details"><div className="alert alert-error">{error}</div></DashboardLayout>;
  if (!issue) return null;

  const currentIndex = STATUS_FLOW.indexOf(issue.status);

  return (
    <DashboardLayout title="Issue Details">
      <button className="link-btn" onClick={() => navigate(-1)} style={{ marginBottom: "15px", cursor: "pointer", background: "none", border: "none", color: "#4f46e5", fontWeight: "bold" }}>← Back</button>

      <div className="details-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
        
        {/* Left Column: Issue Details & Chat */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card-panel" style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
            <div className="details-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h2 style={{ margin: 0 }}>{issue.title}</h2>
              <StatusBadge status={issue.status} />
            </div>
            {issue.image && (
              <img src={issue.image} alt="Issue" className="details-image" style={{ width: "100%", maxHeight: "300px", objectFit: "cover", borderRadius: "8px", marginBottom: "15px" }} />
            )}
            <p style={{ fontSize: "16px", color: "#374151" }}>{issue.description}</p>

            <div className="details-meta-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginTop: "20px", background: "#f9fafb", padding: "15px", borderRadius: "8px" }}>
              <div><span className="muted small" style={{ color: "#6b7280", fontSize: "12px" }}>Location</span><p style={{ margin: "5px 0 0 0", fontWeight: "bold" }}>📍 {issue.location}</p></div>
              <div><span className="muted small" style={{ color: "#6b7280", fontSize: "12px" }}>Department</span><p style={{ margin: "5px 0 0 0", fontWeight: "bold" }}>🏢 {issue.department}</p></div>
              <div><span className="muted small" style={{ color: "#6b7280", fontSize: "12px" }}>Priority</span><div style={{ marginTop: "5px" }}><PriorityBadge priority={issue.priority} /></div></div>
              <div><span className="muted small" style={{ color: "#6b7280", fontSize: "12px" }}>Created</span><p style={{ margin: "5px 0 0 0", fontWeight: "bold" }}>{new Date(issue.createdAt).toLocaleString()}</p></div>
            </div>
          </div>

          {/* Chat / Discussion Section */}
          <div className="card-panel" style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
            <h3 style={{ marginTop: 0, borderBottom: "1px solid #e5e7eb", paddingBottom: "10px" }}>💬 Discussion / Updates</h3>
            
            <div style={{ maxHeight: "300px", overflowY: "auto", padding: "10px 0", display: "flex", flexDirection: "column", gap: "15px" }}>
              {comments.map((msg) => {
                const isMe = msg.sender === (user?.name || "Student");
                return (
                  <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                    <span style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>{msg.sender} ({msg.time})</span>
                    <div style={{ 
                      padding: "10px 15px", 
                      borderRadius: "15px", 
                      background: isMe ? "#4f46e5" : "#f3f4f6", 
                      color: isMe ? "white" : "#1f2937",
                      maxWidth: "80%",
                      borderBottomRightRadius: isMe ? "4px" : "15px",
                      borderBottomLeftRadius: !isMe ? "4px" : "15px"
                    }}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendComment} style={{ display: "flex", gap: "10px", marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #e5e7eb" }}>
              <input 
                type="text" 
                placeholder="Type a message or update..." 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none" }}
              />
              <button type="submit" style={{ padding: "10px 20px", background: "#4f46e5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Timeline & AI Analysis */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div className="card-panel" style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
            <h3 style={{ marginTop: 0 }}>Status Timeline</h3>
            <div className="timeline" style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "15px" }}>
              {STATUS_FLOW.map((s, idx) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: "10px", color: idx <= currentIndex ? "#4f46e5" : "#9ca3af" }}>
                  <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: idx <= currentIndex ? "#4f46e5" : "#e5e7eb" }} />
                  <span style={{ fontWeight: idx === currentIndex ? "bold" : "normal" }}>{s}</span>
                </div>
              ))}
            </div>

            {user?.role === "admin" && (
              <div style={{ marginTop: "25px", paddingTop: "20px", borderTop: "1px solid #e5e7eb" }}>
                <h3 style={{ margin: "0 0 10px 0" }}>Update Status</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {STATUS_FLOW.map((s, idx) => (
                    <button
                      key={s}
                      style={{ 
                        padding: "6px 12px", fontSize: "12px", borderRadius: "6px", cursor: updating || idx < currentIndex - 1 ? "not-allowed" : "pointer",
                        background: s === issue.status ? "#4f46e5" : "#f3f4f6", color: s === issue.status ? "white" : "#374151", border: "none"
                      }}
                      disabled={updating || idx < currentIndex - 1}
                      onClick={() => handleStatusChange(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card-panel" style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
            <h3 style={{ marginTop: 0 }}>💡 AI Analysis</h3>
            {issue.aiAnalysis ? (
              <div>
                {issue.aiAnalysis.summary && <p style={{ fontSize: "14px", color: "#374151" }}><strong>Summary:</strong> {issue.aiAnalysis.summary}</p>}
                {issue.aiAnalysis.suggestedAction && (
                  <p style={{ fontSize: "14px", color: "#374151" }}><strong>Suggested action:</strong> {issue.aiAnalysis.suggestedAction}</p>
                )}
              </div>
            ) : (
              <p className="muted">AI analysis not available yet.</p>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}