import React, { useState } from "react";

export default function AuthorityDashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isSending, setIsSending] = useState(false);

  // Dummy data
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
    // Simulate API call for sending email
    setTimeout(() => {
      setIsSending(false);
      setModalOpen(false);
      alert(`Urgent warning email sent to ${selectedIssue.department} Department!`);
    }, 1500);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h2 style={{ color: "#dc2626", display: "flex", alignItems: "center", gap: "10px" }}>
        ⚠️ Escalated Issues (Overdue)
      </h2>
      <p style={{ color: "#6b7280", marginBottom: "20px" }}>Issues pending for more than 3 days require immediate action.</p>

      {/* Premium Card Container for Table */}
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", overflow: "hidden", border: "1px solid #fee2e2" }}>
        {escalatedIssues.length === 0 ? (
          <p style={{ padding: "20px" }}>No overdue issues. All good!</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fef2f2", textAlign: "left", borderBottom: "2px solid #fca5a5" }}>
                <th style={{ padding: "16px", color: "#991b1b" }}>Issue Title</th>
                <th style={{ padding: "16px", color: "#991b1b" }}>Department</th>
                <th style={{ padding: "16px", color: "#991b1b" }}>Days Pending</th>
                <th style={{ padding: "16px", color: "#991b1b" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {escalatedIssues.map((issue) => (
                <tr key={issue.id} style={{ borderBottom: "1px solid #fee2e2", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = '#fefafa'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: "16px", fontWeight: "600", color: "#111827" }}>{issue.title}</td>
                  <td style={{ padding: "16px", color: "#4b5563" }}>{issue.department}</td>
                  <td style={{ padding: "16px", color: "#dc2626", fontWeight: "bold" }}>{issue.daysPending} Days</td>
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
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", maxWidth: "400px", width: "90%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h3 style={{ marginTop: 0, color: "#dc2626" }}>Confirm Escalation</h3>
            <p>Are you sure you want to send an official warning email to the <strong>{selectedIssue?.department}</strong> department for the issue: <em>"{selectedIssue?.title}"</em>?</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "flex-end" }}>
              <button onClick={() => setModalOpen(false)} style={{ padding: "10px 15px", border: "1px solid #d1d5db", background: "white", borderRadius: "6px", cursor: "pointer" }} disabled={isSending}>
                Cancel
              </button>
              <button onClick={confirmSummon} style={{ padding: "10px 15px", border: "none", background: "#dc2626", color: "white", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "5px" }} disabled={isSending}>
                {isSending ? "Sending..." : "Yes, Send Warning"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}