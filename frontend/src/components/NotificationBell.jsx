import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Click outside close logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bell-wrap" ref={dropdownRef}>
      <button 
        className="icon-btn" 
        onClick={() => setOpen((o) => !o)} 
        aria-label="Notifications"
        style={{ position: "relative", padding: "8px", borderRadius: "50%", background: open ? "#f1f5f9" : "transparent", transition: "0.2s" }}
      >
        <span style={{ fontSize: "22px" }}>🔔</span>
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: "0px", right: "0px", background: "#ef4444", color: "white", 
            fontSize: "10px", fontWeight: "bold", padding: "2px 6px", borderRadius: "10px",
            border: "2px solid white", boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", right: "0", top: "50px", width: "350px", background: "white", 
          borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0", 
          zIndex: 100, overflow: "hidden", animation: "slideDown 0.2s ease-out"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
            <strong style={{ fontSize: "15px", color: "#1e293b" }}>Notifications</strong>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} style={{ background: "none", border: "none", color: "#4f46e5", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: "350px", overflowY: "auto" }}>
            {notifications.length === 0 && <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>No new notifications</div>}
            
            {notifications.slice(0, 5).map((n) => (
              <div
                key={n._id}
                onClick={() => {
                  if (!n.read) markAsRead(n._id);
                  setOpen(false);
                  navigate(n.issue ? `/issues/${n.issue._id || n.issue}` : "/notifications");
                }}
                style={{
                  padding: "12px 15px", borderBottom: "1px solid #f1f5f9", cursor: "pointer",
                  background: n.read ? "white" : "#eff6ff", display: "flex", gap: "10px", alignItems: "flex-start",
                  transition: "background 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = n.read ? "#f8fafc" : "#e0f2fe"}
                onMouseOut={(e) => e.currentTarget.style.background = n.read ? "white" : "#eff6ff"}
              >
                <div style={{ background: n.read ? "#f1f5f9" : "#dbeafe", padding: "8px", borderRadius: "50%", fontSize: "14px" }}>
                  {n.read ? "🔔" : "🔴"}
                </div>
                <div>
                  <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#1e293b", fontWeight: n.read ? "400" : "600", lineHeight: "1.4" }}>{n.message}</p>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>

          <div 
            onClick={() => { setOpen(false); navigate("/notifications"); }}
            style={{ padding: "12px", textAlign: "center", background: "white", borderTop: "1px solid #f1f5f9", color: "#4f46e5", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
            onMouseOver={(e) => e.currentTarget.style.background = "#f8fafc"}
            onMouseOut={(e) => e.currentTarget.style.background = "white"}
          >
            View all notifications
          </div>
        </div>
      )}
    </div>
  );
}