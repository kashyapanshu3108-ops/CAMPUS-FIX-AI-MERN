import { useEffect, useState, useRef } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Profile() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  
  // Modal States
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);

  // PROPER FIX: LocalStorage se purani photo load karna (agar hai toh)
  const [profilePic, setProfilePic] = useState(() => {
    return localStorage.getItem("userProfilePic") || null;
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user?.role === "student") {
      api.get("/issues/my").then((res) => {
        const issues = res.data.issues;
        setStats({
          total: issues.length,
          inProgress: issues.filter((i) => i.status === "In Progress").length,
          resolved: issues.filter((i) => i.status === "Resolved").length,
        });
      });
    }
  }, [user]);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    alert("Profile update request sent!");
    setEditModalOpen(false);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    alert("Password changed successfully!");
    setPasswordModalOpen(false);
  };

  // PROPER FIX: Image ko Base64 mein convert karke LocalStorage mein save karna
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfilePic(base64String);
        localStorage.setItem("userProfilePic", base64String); // Refresh ke baad ke liye save kar liya
      };
      
      reader.readAsDataURL(file); // File ko read karna shuru kiya
    }
  };

  return (
    <DashboardLayout title="Profile">
      <div className="card-panel" style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center", position: "relative" }}>
        
        {/* Hidden File Input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleImageChange}
        />

        {/* Avatar with Upload overlay */}
        <div 
          style={{ position: "relative", width: "80px", margin: "0 auto", cursor: "pointer" }}
          onClick={() => fileInputRef.current.click()}
          title="Change Profile Picture"
        >
          <div className="avatar" style={{ width: "80px", height: "80px", fontSize: "32px", margin: "0 auto 15px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {profilePic ? (
              <img src={profilePic} alt="Profile Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              user?.name?.charAt(0).toUpperCase() || "U"
            )}
          </div>
          <div style={{ position: "absolute", bottom: "15px", right: "-5px", background: "var(--primary)", color: "white", borderRadius: "50%", padding: "5px", fontSize: "12px", border: "2px solid var(--card-bg)" }}>
            📷
          </div>
        </div>

        <h2 style={{ margin: "0 0 5px 0", fontSize: "24px" }}>{user?.name || "User Name"}</h2>
        <p className="muted" style={{ margin: "0 0 20px 0" }}>{user?.email || "user@campus.edu"}</p>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "30px" }}>
          <button onClick={() => setEditModalOpen(true)} className="btn btn-ghost" style={{ padding: "8px 16px", borderRadius: "20px" }}>✏️ Edit Profile</button>
          <button onClick={() => setPasswordModalOpen(true)} className="btn btn-ghost" style={{ padding: "8px 16px", borderRadius: "20px" }}>🔒 Change Password</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", textAlign: "left", background: "var(--bg)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border)" }}>
          <div><span className="muted small">Role</span><p style={{ margin: "5px 0 0", fontWeight: "600", textTransform: "capitalize" }}>{user?.role || "Student"}</p></div>
          <div><span className="muted small">Campus</span><p style={{ margin: "5px 0 0", fontWeight: "600" }}>{user?.campus || "Main Campus"}</p></div>
          <div><span className="muted small">Department / Course</span><p style={{ margin: "5px 0 0", fontWeight: "600" }}>B.Tech Computer Science</p></div>
          <div><span className="muted small">Member since</span><p style={{ margin: "5px 0 0", fontWeight: "600" }}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Just Now"}</p></div>
        </div>

        {stats && (
          <div style={{ marginTop: "30px", textAlign: "left" }}>
            <h3 style={{ marginBottom: "15px" }}>Your Activity</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" }}>
              <div className="card-panel" style={{ padding: "15px", borderRadius: "10px", textAlign: "center", margin: 0, boxShadow: "none", borderBottom: "3px solid #4f46e5" }}>
                <span className="muted small">Total</span>
                <h3 style={{ margin: "5px 0 0", color: "var(--text)" }}>{stats.total}</h3>
              </div>
              <div className="card-panel" style={{ padding: "15px", borderRadius: "10px", textAlign: "center", margin: 0, boxShadow: "none", borderBottom: "3px solid #f59e0b" }}>
                <span className="muted small">In Progress</span>
                <h3 style={{ margin: "5px 0 0", color: "var(--text)" }}>{stats.inProgress}</h3>
              </div>
              <div className="card-panel" style={{ padding: "15px", borderRadius: "10px", textAlign: "center", margin: 0, boxShadow: "none", borderBottom: "3px solid #10b981" }}>
                <span className="muted small">Resolved</span>
                <h3 style={{ margin: "5px 0 0", color: "var(--text)" }}>{stats.resolved}</h3>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div className="card-panel" style={{ width: "90%", maxWidth: "400px" }}>
            <h3 style={{ marginTop: 0 }}>Edit Profile</h3>
            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "15px" }}>
              <div><label className="muted small">Full Name</label><input type="text" defaultValue={user?.name} className="search-input" style={{ width: "100%", marginTop: "5px" }} /></div>
              <div><label className="muted small">Phone Number</label><input type="text" placeholder="+91 XXXXX XXXXX" className="search-input" style={{ width: "100%", marginTop: "5px" }} /></div>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setEditModalOpen(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div className="card-panel" style={{ width: "90%", maxWidth: "400px" }}>
            <h3 style={{ marginTop: 0 }}>Change Password</h3>
            <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "15px" }}>
              <div><label className="muted small">Current Password</label><input type="password" placeholder="••••••••" className="search-input" style={{ width: "100%", marginTop: "5px" }} /></div>
              <div><label className="muted small">New Password</label><input type="password" placeholder="••••••••" className="search-input" style={{ width: "100%", marginTop: "5px" }} /></div>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setPasswordModalOpen(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}