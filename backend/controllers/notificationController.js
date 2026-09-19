const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("issue", "title");

  const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });

  res.json({ success: true, notifications, unreadCount });
});

// PATCH /api/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!notification) return res.status(404).json({ success: false, message: "Notification not found." });

  notification.read = true;
  await notification.save();
  res.json({ success: true, notification });
});

// PATCH /api/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });
  res.json({ success: true, message: "All notifications marked as read." });
});

module.exports = { getNotifications, markAsRead, markAllAsRead };
