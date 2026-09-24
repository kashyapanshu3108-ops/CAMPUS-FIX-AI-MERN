import React, { useState } from "react";
// Sidebar aur Navbar ke liye DashboardLayout import kiya
import DashboardLayout from "../components/DashboardLayout";

export default function MaintenanceDashboard() {
  const [filter, setFilter] = useState("All");
  
  // Dummy data for maintenance tasks
  const [tasks, setTasks] = useState([
    { id: 101, title: "Water Leakage in Washroom", location: "Pt. Lekhraam Hostel", priority: "8/10", date: "9/14/2026", status: "Pending" },
    { id: 102, title: "Broken Fan in Room 204", location: "Block B", priority: "5/10", date: "9/15/2026", status: "In Progress" },
    { id: 103, title: "Fused Tube Light", location: "Library", priority: "3/10", date: "9/16/2026", status: "Resolved" }
  ]);

  const updateStatus = (id, newStatus) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, status: newStatus } : task));
  };

  const filteredTasks = filter === "All" ? tasks : tasks.filter(t => t.status === filter);

  const getBadgeStyle = (status) => {
    if (status === "Pending") return { background: "#fee2e2", color: "#991b1b" };
    if (status === "In Progress") return { background: "#fef3c7", color: "#b45309" };
    if (status === "Resolved") return { background: "#dcfce3", color: "#166534" };
    return { background: "var(--bg)", color: "var(--text)" };
  };

  return (
    <DashboardLayout title="Maintenance Tasks">
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ margin: 0 }}>Maintenance Tasks</h2>
            <p className="muted" style={{ margin: "5px 0 0 0" }}>Manage and update issues assigned to your department.</p>
          </div>
          
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", outline: "none", fontWeight: "bold", background: "var(--card-bg)", color: "var(--text)" }}
          >
            <option value="All">All Tasks</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {filteredTasks.length === 0 ? (
            <div className="card-panel" style={{ textAlign: "center", padding: "20px" }}>
              <p className="muted">No tasks found for this filter.</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div key={task.id} className="card-panel" style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: "0 0 8px 0" }}>{task.title}</h3>
                  <p className="muted small" style={{ margin: "0 0 12px 0", fontSize: "14px" }}>
                    📍 {task.location} &nbsp;|&nbsp; ⚡ Priority: {task.priority} &nbsp;|&nbsp; 📅 Raised: {task.date}
                  </p>
                  <span style={{ padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "bold", ...getBadgeStyle(task.status) }}>
                    {task.status}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
                  {task.status !== "Resolved" && (
                    <>
                      {task.status === "Pending" && (
                        <button onClick={() => updateStatus(task.id, "In Progress")} style={{ padding: "8px 16px", background: "#f59e0b", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                          ▶ Start Work
                        </button>
                      )}
                      <button onClick={() => updateStatus(task.id, "Resolved")} style={{ padding: "8px 16px", background: "#22c55e", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                        ✔ Mark Resolved
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}