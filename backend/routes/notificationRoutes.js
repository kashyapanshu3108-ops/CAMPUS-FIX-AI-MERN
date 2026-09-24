const express = require("express");
const requireDb = require("../middleware/dbCheck");
const { protect } = require("../middleware/auth");
// const { getNotifications, markAsRead, markAllAsRead } = require("../controllers/notificationController");
const { getNotifications, markAsRead, markAllAsRead, clearAllNotifications } = require("../controllers/notificationController");
const router = express.Router();

router.use(requireDb, protect);

router.get("/", getNotifications);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);
router.delete("/clear", protect, clearAllNotifications);
module.exports = router;
