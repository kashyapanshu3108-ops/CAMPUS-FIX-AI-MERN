const mongoose = require("mongoose");

const CATEGORIES = [
  "Water",
  "Electrical",
  "WiFi",
  "Cleanliness",
  "Hostel",
  "Classroom",
  "Furniture",
  "Security",
  "Road & Infrastructure",
  "Other",
];

const SEVERITIES = ["Low", "Medium", "High", "Critical"];

const STATUSES = ["Reported", "AI Analyzed", "Assigned", "In Progress", "Resolved"];

const aiAnalysisSchema = new mongoose.Schema(
  {
    category: String,
    severity: String,
    priority: Number,
    department: String,
    summary: String,
    suggestedAction: String,
    reasoning: String,
    source: { type: String, enum: ["gemini", "fallback"], default: "fallback" },
    analyzedAt: Date,
  },
  { _id: false }
);

const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true },
    description: { type: String, required: [true, "Description is required"], trim: true },
    location: { type: String, required: [true, "Location is required"], trim: true },
    image: { type: String, default: null },

    category: { type: String, enum: CATEGORIES, default: "Other" },
    severity: { type: String, enum: SEVERITIES, default: "Low" },
    priority: { type: Number, min: 1, max: 10, default: 1 },
    department: { type: String, default: "Administration" },

    status: { type: String, enum: STATUSES, default: "Reported" },

    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    aiAnalysis: { type: aiAnalysisSchema, default: null },

    duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: "Issue", default: null },
    duplicateCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

issueSchema.index({ title: "text", description: "text", location: "text" });

module.exports = mongoose.model("Issue", issueSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.SEVERITIES = SEVERITIES;
module.exports.STATUSES = STATUSES;
