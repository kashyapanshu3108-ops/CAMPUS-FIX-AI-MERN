import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// 1. Icon import karein
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "student" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 2. Dono password fields ke liye alag state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 3. Dono password fields ke liye alag ref
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setForm({ ...form, password: "", confirmPassword: "" });
      setShowPassword(false);
      setShowConfirmPassword(false);
      if (passwordRef.current) passwordRef.current.focus();
      return;
    }
    
    // Agar passwords match nahi karte
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      setForm({ ...form, confirmPassword: "" }); // Sirf confirm password empty karein
      setShowConfirmPassword(false);
      if (confirmPasswordRef.current) confirmPasswordRef.current.focus(); // Cursor confirm me le jayein
      return;
    }

    setLoading(true);
    const result = await register(form);
    setLoading(false);

    if (result.success) {
      navigate(result.user.role === "admin" ? "/admin" : "/dashboard");
    } else {
      // API error (jaise Email already exists) par dono password hata dein
      setError(result.message);
      setForm({ ...form, password: "", confirmPassword: "" });
      setShowPassword(false);
      setShowConfirmPassword(false);
      if (passwordRef.current) passwordRef.current.focus();
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo auth-logo">
          <span className="logo-mark">✦</span> CampusFix <span className="logo-ai">AI</span>
        </div>
        <h2>Create your account</h2>
        <p className="muted">Start reporting and tracking campus issues.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>Full name</label>
          <input type="text" name="name" placeholder="Your name" value={form.name} onChange={handleChange} />

          <label>Email</label>
          <input type="email" name="email" placeholder="you@campus.edu" value={form.email} onChange={handleChange} />

          <label>I am a</label>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>

          <label>Password</label>
          {/* Main Password Field */}
          <div style={{ position: "relative", width: "100%" }}>
            <input
              ref={passwordRef}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) => (e.target.placeholder = "At least 6 characters")}
              style={{ width: "100%", paddingRight: "40px", boxSizing: "border-box" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute", right: "12px", top: "50%",
                transform: "translateY(-50%)", background: "none", border: "none",
                cursor: "pointer", display: "flex", alignItems: "center",
                color: "#6b7280", padding: 0
              }}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          <label style={{ marginTop: "10px", display: "block" }}>Confirm password</label>
          {/* Confirm Password Field */}
          <div style={{ position: "relative", width: "100%" }}>
            <input
              ref={confirmPasswordRef}
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={handleChange}
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) => (e.target.placeholder = "Re-enter password")}
              style={{ width: "100%", paddingRight: "40px", boxSizing: "border-box" }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: "absolute", right: "12px", top: "50%",
                transform: "translateY(-50%)", background: "none", border: "none",
                cursor: "pointer", display: "flex", alignItems: "center",
                color: "#6b7280", padding: 0
              }}
            >
              {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={loading} style={{ marginTop: "15px" }}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}