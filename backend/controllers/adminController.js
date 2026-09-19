const Issue = require("../models/Issue");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/admin/stats
const getStats = asyncHandler(async (req, res) => {
  const [total, pending, urgent, resolved, aiAnalyzed, duplicates, inProgress] = await Promise.all([
    Issue.countDocuments({}),
    Issue.countDocuments({ status: { $nin: ["Resolved"] } }),
    Issue.countDocuments({ priority: { $gte: 8 }, status: { $ne: "Resolved" } }),
    Issue.countDocuments({ status: "Resolved" }),
    Issue.countDocuments({ "aiAnalysis.category": { $exists: true } }),
    Issue.countDocuments({ duplicateOf: { $ne: null } }),
    Issue.countDocuments({ status: "In Progress" }),
  ]);

  res.json({
    success: true,
    stats: { total, pending, urgent, resolved, aiAnalyzed, duplicates, inProgress },
  });
});

// GET /api/admin/analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const [byCategory, byStatus, byDepartment, byLocation, avgPriorityAgg, resolvedIssues] = await Promise.all([
    Issue.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Issue.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Issue.aggregate([{ $group: { _id: "$department", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Issue.aggregate([{ $group: { _id: "$location", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]),
    Issue.aggregate([{ $group: { _id: null, avgPriority: { $avg: "$priority" } } }]),
    Issue.find({ status: "Resolved" }).select("createdAt updatedAt"),
  ]);

  const avgPriority = avgPriorityAgg[0]?.avgPriority ? Number(avgPriorityAgg[0].avgPriority.toFixed(1)) : 0;

  let avgResolutionHours = null;
  if (resolvedIssues.length > 0) {
    const totalHours = resolvedIssues.reduce((sum, issue) => {
      const hours = (new Date(issue.updatedAt) - new Date(issue.createdAt)) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);
    avgResolutionHours = Number((totalHours / resolvedIssues.length).toFixed(1));
  }

  const topCategory = byCategory[0]?._id || null;
  const topLocation = byLocation[0]?._id || null;
  const topDepartment = byDepartment[0]?._id || null;

  const insights = [];
  if (topCategory) insights.push(`Most common issue category: ${topCategory} (${byCategory[0].count} reports).`);
  if (topLocation) insights.push(`Most problem-prone location: ${topLocation} (${byLocation[0].count} reports).`);
  if (topDepartment) insights.push(`Most affected department: ${topDepartment} (${byDepartment[0].count} issues).`);
  const urgentAgg = byCategory.length ? await Issue.countDocuments({ priority: { $gte: 8 }, status: { $ne: "Resolved" } }) : 0;
  if (urgentAgg > 0) insights.push(`${urgentAgg} urgent issue${urgentAgg === 1 ? "" : "s"} currently need attention.`);
  if (avgResolutionHours !== null) insights.push(`Average resolution time: ${avgResolutionHours} hours.`);

  res.json({
    success: true,
    analytics: {
      byCategory,
      byStatus,
      byDepartment,
      byLocation,
      avgPriority,
      avgResolutionHours,
      topCategory,
      topLocation,
      topDepartment,
      insights,
    },
  });
});

module.exports = { getStats, getAnalytics };
