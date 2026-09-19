const express = require("express");
const requireDb = require("../middleware/dbCheck");
const { protect, authorize } = require("../middleware/auth");
const { getStats, getAnalytics } = require("../controllers/adminController");
const { getIssues } = require("../controllers/issueController");

const router = express.Router();

router.use(requireDb, protect, authorize("admin"));

router.get("/stats", getStats);
router.get("/analytics", getAnalytics);
router.get("/issues", getIssues);

module.exports = router;
