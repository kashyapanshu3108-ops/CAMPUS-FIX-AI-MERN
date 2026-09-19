const Notification = require("../models/Notification");

// Centralized helper for creating a notification. Swallows errors so a
// notification failure never breaks the main request (e.g. issue submission).
async function createNotification({ user, issue = null, message, type = "status_change" }) {
  try {
    await Notification.create({ user, issue, message, type });
  } catch (err) {
    console.error("Failed to create notification:", err.message);
  }
}

module.exports = { createNotification };
