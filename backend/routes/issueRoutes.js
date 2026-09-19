const express = require("express");
const requireDb = require("../middleware/dbCheck");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  createIssue,
  getIssues,
  getMyIssues,
  getIssueById,
  updateIssueStatus,
  updateIssue,
  deleteIssue,
} = require("../controllers/issueController");

const router = express.Router();

router.use(requireDb, protect);

router.post("/", upload.single("image"), createIssue);
router.get("/", authorize("admin"), getIssues);
router.get("/my", getMyIssues);
router.get("/:id", getIssueById);
router.patch("/:id/status", authorize("admin"), updateIssueStatus);
router.patch("/:id", authorize("admin"), updateIssue);
router.delete("/:id", authorize("admin"), deleteIssue);

module.exports = router;
