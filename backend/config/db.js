const mongoose = require("mongoose");

// Tracks whether MongoDB is currently connected so the rest of the app
// (routes/controllers) can respond gracefully instead of crashing.
let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("MONGO_URI is not set in .env - database features will not work.");
    return;
  }

  try {
    // Fail fast (instead of Mongoose's default ~30s) so the server can start
    // and start responding with friendly 503s quickly if MongoDB is down.
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    isConnected = true;
    console.log("MongoDB connected successfully.");
  } catch (err) {
    isConnected = false;
    console.error("MongoDB connection failed:", err.message);
    console.error("The server will keep running, but any database operation will fail until MongoDB is reachable.");
  }

  mongoose.connection.on("disconnected", () => {
    isConnected = false;
    console.error("MongoDB disconnected.");
  });

  mongoose.connection.on("connected", () => {
    isConnected = true;
  });
};

const isDbConnected = () => isConnected;

module.exports = { connectDB, isDbConnected };
