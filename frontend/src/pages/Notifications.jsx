import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { useNotifications } from "../context/NotificationContext";

const TYPE_ICON = {
  submitted: "📝",
  ai_analyzed: "🤖",
  assigned: "🏢",
  status_change: "🔄",
  resolved: "✅",
  duplicate: "🔗",
};

export default function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  return (
    <DashboardLayout title="Notifications">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", maxWidth: "800px", margin: "0 auto 20px" }}>
        <div>
          <h2 style={{ margin: 0 }}>Activity Feed</h2>
          <p className="muted small" style={{ margin: "5px 0 0" }}>You have {unreadCount} unread messages</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-ghost" onClick={markAllAsRead} style={{ fontSize: "12px", padding: "6px 12px" }}>
            ✔ Mark all as read
          </button>
        )}
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px" }}>
        {notifications.length === 0 && (
          <div className="card-panel" style={{ textAlign: "center", padding: "40px" }}>
            <span style={{ fontSize: "40px" }}>📭</span>
            <p className="muted mt">No notifications yet. You're all caught up!</p>
          </div>
        )}

        {notifications.map((n) => (
          <div
            key={n._id}
            onClick={() => {
              if (!n.read) markAsRead(n._id);
              if (n.issue) navigate(`/issues/${n.issue._id || n.issue}`);
            }}
            style={{
              background: "white", padding: "16px 20px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "15px",
              border: "1px solid #e2e8f0", cursor: "pointer", transition: "all 0.2s",
              borderLeft: n.read ? "1px solid #e2e8f0" : "4px solid #4f46e5",
              boxShadow: n.read ? "none" : "0 4px 10px rgba(79, 70, 229, 0.08)"
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "translateX(5px)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "translateX(0)"}
          >
            <div style={{ width: "45px", height: "45px", borderRadius: "50%", background: n.read ? "#f8fafc" : "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
              {TYPE_ICON[n.type] || "🔔"}
            </div>
            
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 5px 0", color: n.read ? "#4b5563" : "#111827", fontWeight: n.read ? "500" : "600" }}>{n.message}</p>
              <span className="muted small">{new Date(n.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </div>

            {!n.read && <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#4f46e5" }} />}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}