const { isDbConnected } = require("../config/db");

// Blocks a request early with a friendly message if MongoDB isn't reachable,
// instead of letting Mongoose hang or throw a raw connection error.
const requireDb = (req, res, next) => {
  if (!isDbConnected()) {
    return res.status(503).json({
      success: false,
      message: "Server is currently unavailable. Please try again in a moment.",
    });
  }
  next();
};

module.exports = requireDb;
