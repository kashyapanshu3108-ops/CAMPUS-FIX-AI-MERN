import ForgotPassword from "./pages/ForgotPassword";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import ReportIssue from "./pages/ReportIssue";
import MyReports from "./pages/MyReports";
import IssueDetails from "./pages/IssueDetails";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminIssues from "./pages/AdminIssues";
import AdminAnalytics from "./pages/AdminAnalytics";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

// Naye Pages Import kiye gaye hain
import EmergencyContacts from "./pages/EmergencyContacts";
import MaintenanceDashboard from "./pages/MaintenanceDashboard";
import AuthorityDashboard from "./pages/AuthorityDashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/register" element={<Register />} />

      {/* Student routes */}
      <Route path="/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/report" element={<ProtectedRoute role="student"><ReportIssue /></ProtectedRoute>} />
      <Route path="/my-reports" element={<ProtectedRoute role="student"><MyReports /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/issues" element={<ProtectedRoute role="admin"><AdminIssues /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><AdminAnalytics /></ProtectedRoute>} />

      {/* NEW ROUTES ADDED HERE */}
      <Route path="/maintenance-tasks" element={<ProtectedRoute><MaintenanceDashboard /></ProtectedRoute>} />
      <Route path="/admin-escalations" element={<ProtectedRoute><AuthorityDashboard /></ProtectedRoute>} />
      <Route path="/contacts" element={<ProtectedRoute><EmergencyContacts /></ProtectedRoute>} />

      {/* Shared routes (any logged-in user) */}
      <Route path="/issues/:id" element={<ProtectedRoute><IssueDetails /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* 404 Route hamesha sabse last mein aana chahiye */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}