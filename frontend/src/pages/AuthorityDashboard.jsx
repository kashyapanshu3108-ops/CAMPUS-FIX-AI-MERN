import React, { useState } from "react";
// Sidebar aur Navbar ke liye DashboardLayout import kiya
import DashboardLayout from "../components/DashboardLayout";

export default function AuthorityDashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const escalatedIssues = [
    { id: 201, title: "No Electricity in Block C", department: "Electrical", daysPending: 4, raisedBy: "Student 1", email: "electrical@campus.edu" },
    { id: 202, title: "Sewer Line Blocked", department: "Plumbing", daysPending: 6, raisedBy: "Student 2", email: "plumbing@campus.edu" }
  ];

  const handleSummonClick = (issue) => {
    setSelectedIssue(issue);
    setModalOpen(true);
  };

  const confirmSummon = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setModalOpen(false);
      alert(`Urgent warning email sent to ${selectedIssue.department} Department!`);
    }, 1500);
  };

  return (
    <DashboardLayout title="Escalated Issues">
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <h2 style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: "10px", marginTop: 0 }}>
          ⚠️ Escalated Issues (Overdue)
        </h2>
        <p className="muted" style={{ marginBottom: "20px" }}>Issues pending for more than 3 days require immediate action.</p>

        <div className="card-panel" style={{ overflow: "hidden", padding: 0 }}>
          {escalatedIssues.length === 0 ? (
            <p style={{ padding: "20px" }} className="muted">No overdue issues. All good!</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "rgba(239, 68, 68, 0.1)", borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: "16px", color: "#ef4444" }}>Issue Title</th>
                  <th style={{ padding: "16px", color: "#ef4444" }}>Department</th>
                  <th style={{ padding: "16px", color: "#ef4444" }}>Days Pending</th>
                  <th style={{ padding: "16px", color: "#ef4444" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {escalatedIssues.map((issue) => (
                  <tr key={issue.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "16px", fontWeight: "600" }}>{issue.title}</td>
                    <td style={{ padding: "16px", color: "var(--text)" }}>{issue.department}</td>
                    <td style={{ padding: "16px", color: "#ef4444", fontWeight: "bold" }}>{issue.daysPending} Days</td>
                    <td style={{ padding: "16px" }}>
                      <button 
                        onClick={() => handleSummonClick(issue)}
                        style={{ padding: "8px 16px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", boxShadow: "0 2px 4px rgba(239, 68, 68, 0.2)" }}
                      >
                        ✉️ Summon Staff
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Action Modal */}
        {modalOpen && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div className="card-panel" style={{ padding: "30px", borderRadius: "12px", maxWidth: "400px", width: "90%" }}>
              <h3 style={{ marginTop: 0, color: "#ef4444" }}>Confirm Escalation</h3>
              <p>Are you sure you want to send an official warning email to the <strong>{selectedIssue?.department}</strong> department for the issue: <em className="muted">"{selectedIssue?.title}"</em>?</p>
              <div style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "flex-end" }}>
                <button onClick={() => setModalOpen(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button onClick={confirmSummon} style={{ padding: "10px 15px", border: "none", background: "#ef4444", color: "white", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "5px" }} disabled={isSending}>
                  {isSending ? "Sending..." : "Yes, Send Warning"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}