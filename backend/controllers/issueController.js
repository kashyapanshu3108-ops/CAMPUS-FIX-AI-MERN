const Issue = require("../models/Issue");
const asyncHandler = require("../utils/asyncHandler");
const { analyzeIssue } = require("../services/aiService");
const { findDuplicate } = require("../services/duplicateService");
const { createNotification } = require("../services/notificationService");

const STATUS_ORDER = ["Reported", "AI Analyzed", "Assigned", "In Progress", "Resolved"];

// POST /api/issues
const createIssue = asyncHandler(async (req, res) => {
  const { title, description, location, category } = req.body;

  if (!title || !title.trim()) return res.status(400).json({ success: false, message: "Title is required." });
  if (!description || !description.trim())
    return res.status(400).json({ success: false, message: "Description is required." });
  if (!location || !location.trim()) return res.status(400).json({ success: false, message: "Location is required." });

  const image = req.file ? `/uploads/${req.file.filename}` : null;

  const issue = await Issue.create({
    title: title.trim(),
    description: description.trim(),
    location: location.trim(),
    image,
    category: category || "Other",
    reportedBy: req.user._id,
    status: "Reported",
  });

  await createNotification({
    user: req.user._id,
    issue: issue._id,
    message: "Your issue has been received and is waiting for AI analysis.",
    type: "submitted",
  });

  // Run AI analysis. analyzeIssue() never throws - it always resolves,
  // falling back to rule-based analysis on any failure - so the issue
  // is guaranteed to be saved either way.
  const analysis = await analyzeIssue({ title: issue.title, description: issue.description, location: issue.location });

  issue.category = analysis.category;
  issue.severity = analysis.severity;
  issue.priority = analysis.priority;
  issue.department = analysis.department;
  issue.aiAnalysis = { ...analysis, analyzedAt: new Date() };
  issue.status = "AI Analyzed";

  // Duplicate detection - compare against other open, non-duplicate issues.
  const master = await findDuplicate(issue);
  if (master) {
    issue.duplicateOf = master._id;
    master.duplicateCount = (master.duplicateCount || 1) + 1;
    await master.save();

    await createNotification({
      user: req.user._id,
      issue: issue._id,
      message: `We found a similar issue already reported ("${master.title}"). Your report has been linked to it so it gets resolved faster.`,
      type: "duplicate",
    });
  }

  await issue.save();

  await createNotification({
    user: req.user._id,
    issue: issue._id,
    message: `AI analysis complete: categorized as ${analysis.category} (${analysis.severity} severity, priority ${analysis.priority}/10).`,
    type: "ai_analyzed",
  });

  const populated = await Issue.findById(issue._id).populate("reportedBy", "name email");

  res.status(201).json({ success: true, issue: populated, duplicateDetected: Boolean(master) });
});

// GET /api/issues  (admin - all issues, with search/filter/sort)
const getIssues = asyncHandler(async (req, res) => {
  const { status, category, severity, department, search, sort } = req.query;

  const query = {};
  if (status) query.status = status;
  if (category) query.category = category;
  if (severity) query.severity = severity;
  if (department) query.department = department;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
      { department: { $regex: search, $options: "i" } },
    ];
  }

  let sortOption = { createdAt: -1 };
  if (sort === "oldest") sortOption = { createdAt: 1 };
  if (sort === "priority_high") sortOption = { priority: -1 };
  if (sort === "priority_low") sortOption = { priority: 1 };

  const issues = await Issue.find(query)
    .populate("reportedBy", "name email")
    .populate("duplicateOf", "title")
    .sort(sortOption);

  res.json({ success: true, count: issues.length, issues });
});

// GET /api/issues/my
const getMyIssues = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = { reportedBy: req.user._id };
  if (status && status !== "All") query.status = status;

  const issues = await Issue.find(query).sort({ createdAt: -1 });
  res.json({ success: true, count: issues.length, issues });
});

// GET /api/issues/:id
const getIssueById = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id)
    .populate("reportedBy", "name email")
    .populate("duplicateOf", "title status priority duplicateCount");

  if (!issue) return res.status(404).json({ success: false, message: "Issue not found." });

  // Students may only view their own issues; admins may view any.
  if (req.user.role !== "admin" && String(issue.reportedBy._id) !== String(req.user._id)) {
    return res.status(403).json({ success: false, message: "You do not have permission to view this issue." });
  }

  // If this issue is a master issue, show the other reports linked to it.
  const relatedReports = await Issue.find({ duplicateOf: issue._id })
    .select("title reportedBy createdAt status")
    .populate("reportedBy", "name");

  res.json({ success: true, issue, relatedReports });
});

// PATCH /api/issues/:id/status  (admin only)
const updateIssueStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!STATUS_ORDER.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status value." });
  }

  const issue = await Issue.findById(req.params.id);
  if (!issue) return res.status(404).json({ success: false, message: "Issue not found." });

  const currentIndex = STATUS_ORDER.indexOf(issue.status);
  const nextIndex = STATUS_ORDER.indexOf(status);

  // Allow moving forward in the workflow, or backward by one step
  // (e.g. correcting a mistaken "Resolved"). Block jumping around randomly
  // to keep the workflow meaningful, but don't block same-status no-ops.
  if (nextIndex < currentIndex - 1) {
    return res.status(400).json({
      success: false,
      message: `Cannot move status backward from "${issue.status}" to "${status}".`,
    });
  }

  issue.status = status;
  await issue.save();

  const statusMessages = {
    Assigned: `Your issue has been assigned to the ${issue.department} department.`,
    "In Progress": "Your issue is now in progress.",
    Resolved: "Your issue has been resolved.",
  };

  if (statusMessages[status]) {
    await createNotification({
      user: issue.reportedBy,
      issue: issue._id,
      message: statusMessages[status],
      type: status === "Resolved" ? "resolved" : "status_change",
    });

    // If this is a master issue with duplicates, notify every student
    // who reported the duplicate as well.
    const duplicates = await Issue.find({ duplicateOf: issue._id });
    for (const dup of duplicates) {
      await createNotification({
        user: dup.reportedBy,
        issue: dup._id,
        message: statusMessages[status],
        type: status === "Resolved" ? "resolved" : "status_change",
      });
    }
  }

  res.json({ success: true, issue });
});

// PATCH /api/issues/:id  (admin - edit issue fields like department/category)
const updateIssue = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id);
  if (!issue) return res.status(404).json({ success: false, message: "Issue not found." });

  const allowedFields = ["category", "severity", "priority", "department", "title", "description", "location"];
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) issue[field] = req.body[field];
  }

  await issue.save();
  res.json({ success: true, issue });
});

// DELETE /api/issues/:id (admin only)
const deleteIssue = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id);
  if (!issue) return res.status(404).json({ success: false, message: "Issue not found." });
  await issue.deleteOne();
  res.json({ success: true, message: "Issue deleted." });
});

module.exports = {
  createIssue,
  getIssues,
  getMyIssues,
  getIssueById,
  updateIssueStatus,
  updateIssue,
  deleteIssue,
};
