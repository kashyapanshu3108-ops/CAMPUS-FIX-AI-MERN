import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  { icon: "🤖", title: "AI Analysis", desc: "Gemini AI reads every report and classifies category, severity and priority automatically." },
  { icon: "⚡", title: "Smart Priority", desc: "Urgent problems like safety hazards are flagged and surfaced instantly." },
  { icon: "🏢", title: "Department Routing", desc: "Issues are routed to the right team - Maintenance, IT, Security and more." },
  { icon: "🔗", title: "Duplicate Detection", desc: "Multiple reports about the same problem are automatically grouped together." },
  { icon: "📍", title: "Real-time Tracking", desc: "Students track every issue from Reported to Resolved." },
  { icon: "📊", title: "Analytics", desc: "Admins see trends across categories, locations and departments." },
];

const STEPS = [
  { num: "1", title: "Report", desc: "Describe the problem, add a location and photo." },
  { num: "2", title: "AI Analyzes", desc: "Gemini determines category, severity and priority in seconds." },
  { num: "3", title: "Smart Routing", desc: "The issue is sent to the right department automatically." },
  { num: "4", title: "Issue Resolved", desc: "Track progress and get notified the moment it's fixed." },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const goToReport = () => navigate(user ? "/report" : "/register");
  const goToDashboard = () => navigate(user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/login");

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="logo">
          <span className="logo-mark">✦</span> CampusFix <span className="logo-ai">AI</span>
        </div>
        <div className="landing-nav-actions">
          {user ? (
            <button className="btn btn-primary" onClick={goToDashboard}>Go to Dashboard</button>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={() => navigate("/login")}>Login</button>
              <button className="btn btn-primary" onClick={() => navigate("/register")}>Get Started</button>
            </>
          )}
        </div>
      </nav>

      <section className="hero">
        <h1>
          CampusFix <span className="text-gradient">AI</span>
        </h1>
        <p className="hero-tagline">"See a problem? Let's fix it."</p>
        <p className="hero-desc">
          An AI-powered campus issue management platform that automatically analyzes, prioritizes and routes
          campus problems to the right department.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={goToReport}>Report an Issue</button>
          <button className="btn btn-ghost btn-lg" onClick={() => navigate(user ? goToDashboard : "/login")}>
            Login
          </button>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-grid">
          {STEPS.map((s) => (
            <div key={s.num} className="step-card">
              <div className="step-num">{s.num}</div>
              <h3>{s.title}</h3>
              <p className="muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="features">
        <h2>Built for campus problems, big and small</h2>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p className="muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <p className="muted small">CampusFix AI — built for campus communities.</p>
      </footer>
    </div>
  );
}
