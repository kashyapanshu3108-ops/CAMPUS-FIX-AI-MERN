const express = require("express");
const requireDb = require("../middleware/dbCheck");
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register", requireDb, register);
router.post("/login", requireDb, login);
router.get("/me", requireDb, protect, getMe);

module.exports = router;
