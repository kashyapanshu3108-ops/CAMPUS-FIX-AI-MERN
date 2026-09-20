# CampusFix AI

**"See a problem? Let's fix it."**

CampusFix AI is an AI-powered, enterprise-grade campus issue reporting and management platform. Students report campus problems (water leakage, broken fans, WiFi issues, cleanliness, etc.), and Google Gemini automatically analyzes each report to determine category, severity, priority, and the responsible department. Admins, Maintenance Staff, and Campus Authorities can track, update, and resolve issues through role-specific dashboards.

---

## 1. Features

- **Multi-Role Authentication** — JWT-based sessions, bcrypt password hashing, and protected routes for **Students**, **Admins**, **Maintenance Staff**, and **Authorities (Dean/VC)**.
- **Premium UI & Dark Mode** — Modern interface with glassmorphism, soft shadows, and a persistent 🌙 Dark/☀️ Light mode toggle (saved in local storage).
- **Issue Reporting & AI Analysis** — Submit title, description, location, and photos. Google Gemini (`gemini-1.5-flash`) analyzes every issue for category, severity, priority, and assigns the department. Includes a rule-based fallback if AI is unavailable.
- **Duplicate Detection** — New reports are compared against existing open issues. Matches are automatically linked via `duplicateOf` to prevent clutter.
- **Interactive Issue Tracking** — Includes a built-in **Discussion/Chat** section for each issue where students and staff can post updates.
- **Feedback & Rating System** — Once an issue is marked "Resolved", students get a popup to rate the maintenance work out of 5 stars (⭐⭐⭐⭐⭐).
- **1-Click PDF Reports** — Admins can download a beautifully formatted PDF report of the dashboard analytics and urgent issues with a single click.
- **Advanced Dashboards**:
  - **Student**: Dashboard, Report Issue, My Reports (search + status filters), Issue Details, Notifications, Profile (with Avatar upload & Edit Modals).
  - **Admin**: Overview stats, AI insights, duplicate detection, and PDF generation.
  - **Maintenance Staff**: Dedicated Kanban-style task list with status-update badges.
  - **Authority**: View overdue/escalated issues and trigger "Summon Staff" warnings.
  - **Emergency Contacts**: Quick access to Chief Warden, Estate Head, DSW, and IT Helpdesk.

## 2. Tech Stack

| Layer          | Tech                                                       |
|----------------|------------------------------------------------------------|
| Frontend       | React 18, Vite, React Router, Axios, `jspdf`, `html2canvas`|
| Backend        | Node.js, Express                                           |
| Database       | MongoDB + Mongoose                                         |
| AI             | Google Gemini API with rule-based fallback                 |
| Auth           | JWT, bcryptjs                                              |
| Image Upload   | Multer (local disk storage), LocalStorage for Profile Pics |

## 3. Folder Structure

```text
campusfix-ai/
├── backend/
│   ├── config/db.js             # MongoDB connection (fails gracefully)
│   ├── models/                  # User, Issue, Notification
│   ├── middleware/              # auth, role-checks, upload, error handler
│   ├── controllers/             # auth, issue, admin, notification logic
│   ├── routes/                  # API endpoints
│   ├── services/                # aiService, duplicateService, notificationService
│   ├── seed/seed.js             # Demo data generator
│   └── server.js
└── frontend/
    ├── src/
    │   ├── pages/               # Login, Register, StudentDashboard, AdminDashboard,
    │   │                        # MaintenanceDashboard, AuthorityDashboard, MyReports,
    │   │                        # IssueDetails, Notifications, Profile, EmergencyContacts
    │   ├── components/          # DashboardLayout, IssueCard, NotificationBell, Toast
    │   ├── context/             # AuthContext, NotificationContext
    │   └── services/api.js      # Axios instance
    └── index.css                # Global Premium UI & Dark Mode styles
    