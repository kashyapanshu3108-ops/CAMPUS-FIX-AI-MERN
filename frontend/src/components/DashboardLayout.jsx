import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const STUDENT_LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/report", label: "Report Issue", icon: "📝" },
  { to: "/my-reports", label: "My Reports", icon: "📋" },
  { to: "/contacts", label: "Emergency Contacts", icon: "📞" },
  { to: "/notifications", label: "Notifications", icon: "🔔" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

const ADMIN_LINKS = [
  { to: "/admin", label: "Dashboard", icon: "🏠" },
  { to: "/admin/issues", label: "All Issues", icon: "📋" },
  { to: "/admin/analytics", label: "Analytics", icon: "📊" },
  { to: "/maintenance-tasks", label: "Maintenance Tasks", icon: "🔧" }, 
  { to: "/admin-escalations", label: "Escalated Issues", icon: "⚠️" }, 
  { to: "/contacts", label: "Emergency Contacts", icon: "📞" },
  { to: "/notifications", label: "Notifications", icon: "🔔" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

const MAINTENANCE_LINKS = [
  { to: "/maintenance-tasks", label: "My Tasks", icon: "🔧" },
  { to: "/contacts", label: "Emergency Contacts", icon: "📞" },
  { to: "/notifications", label: "Notifications", icon: "🔔" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

const AUTHORITY_LINKS = [
  { to: "/admin-escalations", label: "Escalated Issues", icon: "⚠️" },
  { to: "/contacts", label: "Emergency Contacts", icon: "📞" },
  { to: "/notifications", label: "Notifications", icon: "🔔" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

export default function DashboardLayout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // 🌙 Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // 📷 Topbar Avatar State
  const [topbarPic, setTopbarPic] = useState(() => localStorage.getItem(`profilePic_${user?.email}`) || null);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // FIX: Listen for profile photo updates
  useEffect(() => {
    const updatePic = () => {
      setTopbarPic(localStorage.getItem(`profilePic_${user?.email}`));
    };
    window.addEventListener("profilePicUpdated", updatePic);
    updatePic(); 
    return () => window.removeEventListener("profilePicUpdated", updatePic);
  }, [user?.email]);

  let links = STUDENT_LINKS;
  if (user?.role === "admin") links = ADMIN_LINKS;
  else if (user?.role === "maintenance") links = MAINTENANCE_LINKS;
  else if (user?.role === "authority") links = AUTHORITY_LINKS;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <span className="logo-mark">✦</span> CampusFix <span className="logo-ai">AI</span>
        </div>
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/dashboard" || link.to === "/admin" || link.to === "/maintenance-tasks" || link.to === "/admin-escalations"}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            >
              <span>{link.icon}</span> {link.label}
            </NavLink>
          ))}
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>
          🚪 Logout
        </button>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div>
            <h1>{title}</h1>
            <p className="muted">Welcome back, {user?.name?.split(" ")[0] || "User"}</p>
          </div>
          <div className="topbar-actions">
            
            {/* Dark Mode Toggle Button */}
            <button 
              className="icon-btn" 
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={{ fontSize: "20px", padding: "8px", borderRadius: "50%", background: isDarkMode ? "#334155" : "#f1f5f9", transition: "0.3s" }}
              title="Toggle Theme"
            >
              {isDarkMode ? "🌙" : "☀️"}
            </button>

            <NotificationBell />
            
            {/* FIX: Show Image in Topbar Avatar */}
            <div className="avatar" onClick={() => navigate("/profile")} title={user?.name || "Profile"} style={{ cursor: "pointer", overflow: "hidden" }}>
              {topbarPic ? (
                <img src={topbarPic} alt="User" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                user?.name ? user.name.charAt(0).toUpperCase() : "U"
              )}
            </div>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}