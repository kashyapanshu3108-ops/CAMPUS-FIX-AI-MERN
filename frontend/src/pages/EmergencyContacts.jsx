import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";

export default function EmergencyContacts() {
  const { user } = useAuth();
  // Role check: Sirf admin ko edit/delete aur add rights milenge
  const isAdmin = user?.role === "admin";

  const defaultContacts = [
    { id: 1, role: "Chief Warden", name: "Dr. R.K. Sharma", phone: "+919876543210", email: "warden@campus.edu" },
    { id: 2, role: "Maintenance Head (Estate)", name: "Mr. A.K. Verma", phone: "+919876543211", email: "estate@campus.edu" },
    { id: 3, role: "Dean of Student Welfare (DSW)", name: "Dr. S. Gupta", phone: "+919876543212", email: "dean@campus.edu" },
    { id: 4, role: "IT Helpdesk", name: "Campus IT Support", phone: "+919876543213", email: "ithelp@campus.edu" }
  ];

  // LocalStorage use kar rahe hain taaki refresh hone par bhi data rahe
  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem("campusfix_contacts");
    return saved ? JSON.parse(saved) : defaultContacts;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({ role: "", name: "", phone: "", email: "" });

  // Jab bhi contacts change honge, wo save ho jayenge
  useEffect(() => {
    localStorage.setItem("campusfix_contacts", JSON.stringify(contacts));
  }, [contacts]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      setContacts(contacts.filter(c => c.id !== id));
    }
  };

  const openModal = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setFormData(contact);
    } else {
      setEditingContact(null);
      setFormData({ role: "", name: "", phone: "", email: "" });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingContact) {
      setContacts(contacts.map(c => c.id === editingContact.id ? { ...formData, id: c.id } : c));
    } else {
      setContacts([...contacts, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  return (
    <DashboardLayout title="Emergency Contacts">
      <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative" }}>
        
        {/* Header aur Add Button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <p className="muted" style={{ margin: 0 }}>Reach out directly for urgent campus issues.</p>
          
          {isAdmin && (
            <button onClick={() => openModal()} className="btn btn-primary" style={{ padding: "8px 16px", borderRadius: "8px", fontWeight: "bold" }}>
              ➕ Add Contact
            </button>
          )}
        </div>

        {/* Contacts Grid */}
        <div style={{ display: "grid", gap: "15px", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          {contacts.map((contact) => (
            <div key={contact.id} className="card-panel" style={{ padding: "15px", borderRadius: "8px", position: "relative" }}>
              
              {/* Edit/Delete Icons (Sirf Admin ke liye) */}
              {isAdmin && (
                <div style={{ position: "absolute", top: "15px", right: "15px", display: "flex", gap: "12px" }}>
                  <button onClick={() => openModal(contact)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }} title="Edit">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(contact.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }} title="Delete">
                    🗑️
                  </button>
                </div>
              )}

              <h3 style={{ margin: "0 0 5px 0", color: "#4f46e5", paddingRight: isAdmin ? "60px" : "0" }}>{contact.role}</h3>
              <p style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>{contact.name}</p>
              
              <div style={{ display: "flex", gap: "10px" }}>
                <a href={`tel:${contact.phone}`} className="btn btn-primary" style={{ textDecoration: "none", padding: "8px 12px", fontSize: "14px" }}>
                  📞 Call
                </a>
                <a href={`mailto:${contact.email}`} className="btn btn-ghost" style={{ textDecoration: "none", padding: "8px 12px", fontSize: "14px", border: "1px solid var(--border)" }}>
                  ✉️ Email
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div className="card-panel" style={{ width: "90%", maxWidth: "400px", padding: "20px", borderRadius: "12px" }}>
              <h3 style={{ marginTop: 0 }}>{editingContact ? "Edit Contact" : "Add New Contact"}</h3>
              
              <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "15px" }}>
                <div>
                  <label className="muted small">Role / Title (e.g., Chief Warden)</label>
                  <input type="text" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="search-input" style={{ width: "100%", marginTop: "5px" }} required />
                </div>
                <div>
                  <label className="muted small">Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="search-input" style={{ width: "100%", marginTop: "5px" }} required />
                </div>
                <div>
                  <label className="muted small">Phone Number</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="search-input" style={{ width: "100%", marginTop: "5px" }} required />
                </div>
                <div>
                  <label className="muted small">Email Address</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="search-input" style={{ width: "100%", marginTop: "5px" }} required />
                </div>
                
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}