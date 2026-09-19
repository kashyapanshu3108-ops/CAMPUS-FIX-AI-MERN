const { GoogleGenerativeAI } = require("@google/generative-ai");

const VALID_CATEGORIES = [
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
const VALID_SEVERITIES = ["Low", "Medium", "High", "Critical"];

/**
 * Rule-based fallback analyzer. Used whenever the Gemini API key is missing,
 * the API call fails, times out, or returns something that can't be parsed.
 * This keeps the app fully demo-able even with no internet / no API key.
 */
function fallbackAnalyze({ title = "", description = "", location = "" }) {
  const text = `${title} ${description}`.toLowerCase();

  const rules = [
    { keywords: ["water", "leak", "pipe", "tap", "flood", "drip"], category: "Water", department: "Maintenance" },
    { keywords: ["wifi", "wi-fi", "internet", "router", "network", "lan"], category: "WiFi", department: "IT Support" },
    { keywords: ["fan", "light", "electric", "wire", "socket", "switch", "power cut", "short circuit"], category: "Electrical", department: "Electrical" },
    { keywords: ["dirty", "garbage", "trash", "clean", "smell", "waste", "litter"], category: "Cleanliness", department: "Cleaning Staff" },
    { keywords: ["hostel", "room", "warden", "mess"], category: "Hostel", department: "Hostel Management" },
    { keywords: ["classroom", "projector", "board", "desk in class"], category: "Classroom", department: "Administration" },
    { keywords: ["chair", "table", "furniture", "broken bench", "door", "window"], category: "Furniture", department: "Maintenance" },
    { keywords: ["theft", "unsafe", "security", "stranger", "harassment", "cctv"], category: "Security", department: "Security" },
    { keywords: ["road", "pathway", "pothole", "footpath", "street light", "drain"], category: "Road & Infrastructure", department: "Maintenance" },
  ];

  let matched = rules.find((r) => r.keywords.some((k) => text.includes(k)));
  const category = matched ? matched.category : "Other";
  const department = matched ? matched.department : "Administration";

  const urgentWords = ["urgent", "danger", "unsafe", "slip", "shock", "fire", "flood", "severe", "immediately"];
  const isUrgent = urgentWords.some((w) => text.includes(w));

  let severity = "Medium";
  if (isUrgent || category === "Security" || category === "Water") severity = "High";
  if (text.includes("fire") || text.includes("shock") || text.includes("collapse")) severity = "Critical";
  if (category === "Cleanliness" && !isUrgent) severity = "Low";

  const severityToPriority = { Low: 3, Medium: 5, High: 8, Critical: 10 };
  const priority = severityToPriority[severity];

  return {
    category,
    severity,
    priority,
    department,
    summary: `${category} issue reported at ${location || "an unspecified location"}.`,
    suggestedAction: `${department} team should inspect and resolve the reported ${category.toLowerCase()} issue.`,
    reasoning: "Generated using keyword-based fallback analysis because AI analysis was unavailable.",
    source: "fallback",
  };
}

function sanitizeResult(raw, fallbackInput) {
  if (!raw || typeof raw !== "object") return fallbackAnalyze(fallbackInput);

  const category = VALID_CATEGORIES.includes(raw.category) ? raw.category : "Other";
  const severity = VALID_SEVERITIES.includes(raw.severity) ? raw.severity : "Medium";
  let priority = Number(raw.priority);
  if (!Number.isFinite(priority) || priority < 1 || priority > 10) priority = 5;
  priority = Math.round(priority);

  return {
    category,
    severity,
    priority,
    department: typeof raw.department === "string" && raw.department.trim() ? raw.department.trim() : "Administration",
    summary: typeof raw.summary === "string" && raw.summary.trim() ? raw.summary.trim() : "Issue reported by student.",
    suggestedAction:
      typeof raw.suggestedAction === "string" && raw.suggestedAction.trim()
        ? raw.suggestedAction.trim()
        : "Relevant department should inspect the issue.",
    reasoning: typeof raw.reasoning === "string" ? raw.reasoning.trim() : "",
    source: "gemini",
  };
}

function extractJson(text) {
  // Gemini sometimes wraps JSON in markdown fences - strip those first.
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in AI response.");
  return JSON.parse(cleaned.slice(start, end + 1));
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("AI request timed out")), ms)),
  ]);
}

/**
 * Analyzes an issue using Gemini. Always resolves (never throws) -
 * on any failure it resolves with the rule-based fallback result instead,
 * so the calling code never has to handle an AI outage as a special case.
 */
async function analyzeIssue({ title, description, location, imageBase64, mimeType = "image/jpeg" }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    console.warn("GEMINI_API_KEY not configured - using fallback analysis.");
    return fallbackAnalyze({ title, description, location });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `You are an assistant that triages campus facility complaints for a college.
Analyze the following issue report(and the attach image if provided) and respond with STRICT JSON only - no markdown, no extra text.

Title: ${title}
Description: ${description}
Location: ${location}

Respond with exactly this JSON shape:
{
  "category": one of ["Water","Electrical","WiFi","Cleanliness","Hostel","Classroom","Furniture","Security","Road & Infrastructure","Other"],
  "severity": one of ["Low","Medium","High","Critical"],
  "priority": integer from 1 to 10 (10 = most urgent),
  "department": one of ["Maintenance","Electrical","IT Support","Hostel Management","Cleaning Staff","Security","Administration"],
  "summary": a one-sentence plain-English summary of the issue,
  "suggestedAction": a one-sentence recommended next step for the department,
  "reasoning": a short explanation of why you chose this category/severity
}`;
const parts = [prompt];
if (imageBase64) {
      parts.push({
        inlineData: {
          data: imageBase64, // Image ka base64 string (bina "data:image/jpeg;base64," prefix ke)
          mimeType: mimeType
        }
      });
    }
   const result = await model.generateContent(parts);
    const responseText = result.response.text();
    
    // JSON parse karke return karein
    return JSON.parse(responseText.replace(/```json/g, "").replace(/```/g, "").trim());

  }catch (error) {
    console.error("Gemini Analysis Error:", error);
    return fallbackAnalyze({ title, description, location });
  }
}

module.exports = { analyzeIssue, fallbackAnalyze };
