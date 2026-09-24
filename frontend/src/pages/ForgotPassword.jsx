import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setStatus("error");
      return;
    }
    
    setStatus("loading");
    
    // Fake API call for Hackathon Demo (1.5 seconds delay)
    setTimeout(() => {
      setStatus("success");
    }, 1500);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo auth-logo">
          <span className="logo-mark">✦</span> CampusFix <span className="logo-ai">AI</span>
        </div>
        <h2>Reset Password</h2>
        
        {status === "success" ? (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <div className="alert alert-success" style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
              ✅ A password reset link has been sent to <strong>{email}</strong>.
            </div>
            <p className="muted small">Please check your inbox and spam folder.</p>
            <Link to="/login" className="btn btn-primary" style={{ display: "inline-block", marginTop: "15px", textDecoration: "none" }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="muted">Enter your registered email address and we'll send you a link to reset your password.</p>
            
            {status === "error" && <div className="alert alert-error">Please enter a valid email address.</div>}

            <form onSubmit={handleSubmit}>
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="you@campus.edu" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
              <button 
                className="btn btn-primary btn-block" 
                type="submit" 
                disabled={status === "loading"} 
                style={{ marginTop: "15px" }}
              >
                {status === "loading" ? "Sending Link..." : "Send Reset Link"}
              </button>
            </form>

            <p className="auth-switch" style={{ marginTop: "20px" }}>
              Remember your password? <Link to="/login">Back to Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}