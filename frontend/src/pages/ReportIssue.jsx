import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import api, { getErrorMessage } from "../services/api";
import { useToast } from "../components/Toast";

const CATEGORIES = [
  "Water", "Electrical", "WiFi", "Cleanliness", "Hostel",
  "Classroom", "Furniture", "Security", "Road & Infrastructure", "Other",
];

export default function ReportIssue() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState({ title: "", description: "", location: "", category: "Other" });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | analyzing
  const [result, setResult] = useState(null);
  const [duplicateDetected, setDuplicateDetected] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required.";
    if (!form.description.trim()) errs.description = "Description is required.";
    if (!form.location.trim()) errs.location = "Location is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (status !== "idle") return; // prevent duplicate submissions

    setStatus("submitting");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (image) formData.append("image", image);

      setStatus("analyzing");
      const res = await api.post("/issues", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(res.data.issue);
      setDuplicateDetected(res.data.duplicateDetected);
      showToast("Your issue has been successfully reported.", "success");
      setStatus("idle");
    } catch (err) {
      showToast(getErrorMessage(err), "error");
      setStatus("idle");
    }
  };

  if (result) {
    return (
      <DashboardLayout title="Report Issue">
        <div className="result-card">
          <h2>✅ Your issue has been successfully reported</h2>
          {duplicateDetected && (
            <div className="alert alert-info">
              🔗 Possible duplicate detected — this looks similar to an issue already reported. Your report has been
              linked so it gets resolved faster.
            </div>
          )}
          <div className="ai-analysis-box">
            <h3>AI Analysis Complete</h3>
            <div className="ai-analysis-grid">
              <div><span className="muted small">Category</span><p>{result.category}</p></div>
              <div><span className="muted small">Severity</span><p>{result.severity}</p></div>
              <div><span className="muted small">Priority</span><p>{result.priority}/10</p></div>
              <div><span className="muted small">Department</span><p>{result.department}</p></div>
            </div>
            {result.aiAnalysis?.summary && <p className="muted">{result.aiAnalysis.summary}</p>}
            {result.aiAnalysis?.source === "fallback" && (
              <p className="muted small">⚠️ AI analysis is temporarily unavailable — a rule-based estimate was used instead.</p>
            )}
          </div>
          <div className="result-actions">
            <button className="btn btn-primary" onClick={() => navigate(`/issues/${result._id}`)}>View Details</button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setResult(null);
                setForm({ title: "", description: "", location: "", category: "Other" });
                setImage(null);
                setImagePreview(null);
              }}
            >
              Report Another Issue
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Report an Issue">
      <form className="report-form card-panel" onSubmit={handleSubmit}>
        <label>Title *</label>
        <input name="title" placeholder="e.g. Water Leakage in Hostel A" value={form.title} onChange={handleChange} />
        {errors.title && <span className="field-error">{errors.title}</span>}

        <label>Description *</label>
        <textarea
          name="description"
          rows={4}
          placeholder="Describe the problem in detail..."
          value={form.description}
          onChange={handleChange}
        />
        {errors.description && <span className="field-error">{errors.description}</span>}

        <label>Location *</label>
        <input name="location" placeholder="e.g. Hostel A" value={form.location} onChange={handleChange} />
        {errors.location && <span className="field-error">{errors.location}</span>}

        <label>Category (optional — AI will refine this)</label>
        <select name="category" value={form.category} onChange={handleChange}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <label>Photo (optional)</label>
        <input type="file" accept="image/*" onChange={handleImage} />
        {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}

        <button className="btn btn-primary btn-block" type="submit" disabled={status !== "idle"}>
          {status === "submitting" && "Submitting..."}
          {status === "analyzing" && "AI is analyzing your report..."}
          {status === "idle" && "Submit Issue"}
        </button>
      </form>
    </DashboardLayout>
  );
}
