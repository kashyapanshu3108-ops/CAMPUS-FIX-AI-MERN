# CampusFix AI

**"See a problem? Let's fix it."**

CampusFix AI is an AI-powered campus issue reporting and management platform. Students report campus
problems (water leakage, broken fans, WiFi issues, cleanliness, hostel/security problems, etc.), Google
Gemini automatically analyzes each report to determine category, severity, priority and the responsible
department, and admins track and resolve issues from a dashboard. Reports that describe the same
real-world problem are automatically linked together instead of duplicated.

---

## 1. Features

- **Authentication** — register/login as Student or Admin, JWT-based sessions, bcrypt password hashing, protected routes, role-based access.
- **Issue reporting** — title, description, location, optional photo upload, client + server-side validation.
- **AI analysis (Gemini)** — every issue is analyzed for category, severity (Low–Critical), priority (1–10), department, a summary and a suggested action. If Gemini is unavailable or no API key is configured, a rule-based fallback analyzer keeps the app fully working.
- **Duplicate detection** — new reports are compared against existing open issues (keyword overlap + location match). Matches are linked via `duplicateOf` / `duplicateCount` — nothing is deleted, every student's report is kept.
- **Status workflow** — Reported → AI Analyzed → Assigned → In Progress → Resolved, enforced by the backend.
- **Notifications** — created on submission, AI analysis, duplicate detection, and every status change; unread badge, mark-as-read / mark-all-as-read.
- **Student pages** — Dashboard, Report Issue, My Reports (search + status filters), Issue Details, Notifications, Profile.
- **Admin pages** — Dashboard (stats + AI insights + urgent issues), All Issues (search/filter/sort), Analytics (category/status/department/location breakdowns, avg. priority, avg. resolution time), Issue Details with status controls.
- **Demo data** — seed script creates 2 demo accounts and 8 demo issues, including a 3-report duplicate cluster so the duplicate-detection feature is visible immediately.

## 2. Tech Stack

| Layer          | Tech                                              |
|----------------|----------------------------------------------------|
| Frontend       | React 18, Vite, React Router, Axios                |
| Backend        | Node.js, Express                                   |
| Database       | MongoDB + Mongoose                                 |
| AI             | Google Gemini API (`gemini-1.5-flash`) with rule-based fallback |
| Auth           | JWT, bcryptjs                                      |
| Image upload   | Multer (local disk storage, served from `/uploads`) |

## 3. Folder Structure

```
campusfix-ai/
├── backend/
│   ├── config/db.js            # MongoDB connection (fails gracefully, never crashes)
│   ├── models/                 # User, Issue, Notification
│   ├── middleware/              # auth, admin-only, upload, db-check, error handler
│   ├── controllers/             # auth, issue, admin, notification logic
│   ├── routes/                  # /api/auth, /api/issues, /api/admin, /api/notifications
│   ├── services/                # aiService (Gemini + fallback), duplicateService, notificationService
│   ├── seed/seed.js             # demo data
│   ├── uploads/                 # uploaded issue photos
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/                # Landing, Login, Register, StudentDashboard, ReportIssue,
    │   │                         #   MyReports, IssueDetails, Notifications, Profile,
    │   │                         #   AdminDashboard, AdminIssues, AdminAnalytics
    │   ├── components/           # DashboardLayout, IssueCard, badges, NotificationBell, Toast, etc.
    │   ├── context/               # AuthContext, NotificationContext
    │   └── services/api.js       # Axios instance + error helper
    └── .env.example
```

## 4. Setup & Installation

### Prerequisites
- Node.js 18+
- A MongoDB database — either:
  - **Local**: install MongoDB Community Server and run it (`mongod`), or
  - **Free cloud option**: create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and copy its connection string.
- (Optional but recommended) A free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey). Without it, the app still works fully using the built-in rule-based fallback analyzer.

### Backend setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env and fill in MONGO_URI, JWT_SECRET, GEMINI_API_KEY (see section 6)
npm run dev        # starts on http://localhost:5000
```

### Seed demo data (optional but recommended for a demo)

With the backend's `.env` pointing at a reachable MongoDB:

```bash
cd backend
npm run seed
```

This creates demo accounts and 8 demo issues (including a 3-report duplicate cluster on "Hostel A Water Leakage").

### Frontend setup

```bash
cd frontend
npm install
npm run dev         # starts on http://localhost:5173
```

Vite proxies `/api` and `/uploads` requests to `http://localhost:5000` automatically in development (see
`frontend/vite.config.js`), so you generally don't need to set `VITE_API_URL` locally.

Open **http://localhost:5173** in your browser.

## 5. Demo Accounts

After running `npm run seed`:

| Role    | Email                  | Password    |
|---------|-------------------------|-------------|
| Student | student@campusfix.com  | student123  |
| Admin   | admin@campusfix.com    | admin123    |

(Two more demo students exist for the duplicate-cluster demo: `rahul@campusfix.com` / `priya@campusfix.com`, same password `student123`.)

These are development/demo-only credentials — never reuse them in a real deployment.

You can also just register your own account from `/register` and choose "Student" or "Admin".

## 6. Environment Variables

### `backend/.env`

```
PORT=5000
CLIENT_URL=http://localhost:5173

MONGO_URI=mongodb://127.0.0.1:27017/campusfix
# or an Atlas connection string, e.g.
# MONGO_URI=mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/campusfix

JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=7d

GEMINI_API_KEY=your_gemini_api_key_here
```

### `frontend/.env` (optional in dev)

```
VITE_API_URL=/api
```

## 7. MongoDB Setup

**Option A — Local:** install MongoDB Community Edition, then run `mongod`. Default `MONGO_URI` in
`.env.example` (`mongodb://127.0.0.1:27017/campusfix`) will work as-is.

**Option B — Atlas (no local install needed):**
1. Create a free cluster at https://www.mongodb.com/cloud/atlas/register
2. Create a database user and password
3. Under Network Access, allow your current IP (or `0.0.0.0/0` for quick testing)
4. Copy the connection string from "Connect → Drivers" and paste it into `MONGO_URI` in `backend/.env`

If MongoDB is unreachable, the backend still starts and the frontend still loads — any request that needs
the database returns a clear `"Server is currently unavailable"` message instead of crashing.

## 8. Gemini API Setup

1. Go to https://aistudio.google.com/app/apikey and create a free API key
2. Paste it into `GEMINI_API_KEY` in `backend/.env`
3. Restart the backend

If the key is missing, invalid, the API times out, or returns something unparseable, `services/aiService.js`
automatically falls back to a keyword-based rule engine — every issue still gets a category, severity,
priority and department, clearly marked with `"source": "fallback"` in the AI analysis.

## 9. API Overview

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

POST   /api/issues                 (multipart/form-data, field "image")
GET    /api/issues                 (admin — search/filter/sort via query params)
GET    /api/issues/my
GET    /api/issues/:id
PATCH  /api/issues/:id/status      (admin)
PATCH  /api/issues/:id             (admin)
DELETE /api/issues/:id             (admin)

GET    /api/admin/stats
GET    /api/admin/analytics
GET    /api/admin/issues

GET    /api/notifications
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all
```

## 10. Project Architecture Notes

- **AI never blocks or crashes the app.** `analyzeIssue()` always resolves — on any Gemini failure it
  resolves with the rule-based fallback result instead of throwing, so issue submission always succeeds.
- **Duplicate detection** (`services/duplicateService.js`) tokenizes title+description (stripping common
  stopwords), computes Jaccard word-overlap similarity against other open, non-duplicate issues, and adds a
  bonus when locations match. Above a similarity threshold, the new issue is linked via `duplicateOf` and
  the master issue's `duplicateCount` is incremented. No reports are ever deleted.
- **Status transitions** are validated server-side against the fixed workflow order, preventing arbitrary
  jumps (e.g. Reported straight to Resolved) while still allowing a one-step correction backward.
- **Images** are stored on local disk via Multer and served from `/uploads` — no external service required
  to run the demo. Swap `middleware/upload.js` for a Cloudinary/S3-backed implementation if you need hosted
  URLs in production.

## 11. Known Limitations

- Image storage is local disk, not cloud-hosted — fine for a single-server demo, not for a multi-instance production deployment.
- Duplicate detection uses lightweight keyword + location similarity rather than a Gemini-embedding-based semantic match; it correctly catches close paraphrases (as in the demo scenario) but may miss duplicates phrased very differently.
- No password-reset flow.
- No pagination on issue lists yet — fine for demo-scale data, would need to be added for a large real deployment.
- Rate limiting is applied only to `/api/auth` routes as a basic anti-abuse measure, not a full production security hardening pass.
