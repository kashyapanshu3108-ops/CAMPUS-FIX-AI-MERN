// Central error handler. Never leaks raw stack traces / internal
// error messages to the client - only friendly, generic messages.
const errorHandler = (err, req, res, next) => {
  console.error("Server error:", err);

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages[0] || "Invalid input." });
  }

  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: "An account with this email already exists." });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid ID format." });
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Session expired. Please login again." });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.publicMessage || "Something went wrong. Please try again.",
  });
};

const notFound = (req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
};

module.exports = { errorHandler, notFound };
