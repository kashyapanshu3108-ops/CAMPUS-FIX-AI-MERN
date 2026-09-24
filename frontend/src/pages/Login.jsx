import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function Login() {
  // Yahan user ko bhi extract kiya hai auth context se
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef(null);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Agar user pehle se logged in hai toh direct dashboard bhej do
  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);

    if (result.success) {
      navigate(result.user.role === "admin" ? "/admin" : "/dashboard");
    } else {
      setError(result.message);
      setForm({ ...form, password: "" }); 
      setShowPassword(false); 
      if (passwordRef.current) {
        passwordRef.current.focus();
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo auth-logo">
          <span className="logo-mark">✦</span> CampusFix <span className="logo-ai">AI</span>
        </div>
        <h2>Welcome back</h2>
        <p className="muted">Login to report and track campus issues.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input 
            type="email" 
            name="email" 
            placeholder="you@campus.edu" 
            value={form.email} 
            onChange={handleChange} 
          />

          <label>Password</label>
          <div style={{ position: "relative", width: "100%" }}>
            <input 
              ref={passwordRef}
              type={showPassword ? "text" : "password"} 
              name="password" 
              placeholder="••••••••" 
              value={form.password} 
              onChange={handleChange} 
              onFocus={(e) => (e.target.placeholder = "")} 
              onBlur={(e) => (e.target.placeholder = "••••••••")} 
              style={{ width: "100%", paddingRight: "40px", boxSizing: "border-box" }} 
            />
            
            <button
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: "#6b7280",
                padding: 0
              }}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={loading} style={{ marginTop: "15px" }}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="muted small auth-demo-hint">
          Demo: student@campusfix.com / student123 &nbsp;•&nbsp; admin@campusfix.com / admin123
        </p>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}