import React from "react";
// 1. DashboardLayout ko import kiya
import DashboardLayout from "../components/DashboardLayout";

export default function EmergencyContacts() {
  const contacts = [
    { id: 1, role: "Chief Warden", name: "Dr. R.K. Sharma", phone: "+919876543210", email: "warden@campus.edu" },
    { id: 2, role: "Maintenance Head (Estate)", name: "Mr. A.K. Verma", phone: "+919876543211", email: "estate@campus.edu" },
    { id: 3, role: "Dean of Student Welfare (DSW)", name: "Dr. S. Gupta", phone: "+919876543212", email: "dean@campus.edu" },
    { id: 4, role: "IT Helpdesk", name: "Campus IT Support", phone: "+919876543213", email: "ithelp@campus.edu" }
  ];

  return (
    // 2. Poore content ko DashboardLayout mein wrap kar diya
    <DashboardLayout title="Emergency Contacts">
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <p style={{ color: "#6b7280", marginBottom: "20px" }}>Reach out directly for urgent campus issues.</p>

        <div style={{ display: "grid", gap: "15px", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          {contacts.map((contact) => (
            <div key={contact.id} style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "15px", backgroundColor: "#fff" }}>
              <h3 style={{ margin: "0 0 5px 0", color: "#4f46e5" }}>{contact.role}</h3>
              <p style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>{contact.name}</p>
              <div style={{ display: "flex", gap: "10px" }}>
                <a href={`tel:${contact.phone}`} className="btn btn-primary" style={{ textDecoration: "none", padding: "8px 12px", fontSize: "14px" }}>
                  📞 Call
                </a>
                <a href={`mailto:${contact.email}`} className="btn" style={{ textDecoration: "none", padding: "8px 12px", fontSize: "14px", border: "1px solid #ccc", color: "#333" }}>
                  ✉️ Email
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}