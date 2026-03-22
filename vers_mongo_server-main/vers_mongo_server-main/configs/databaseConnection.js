const mongoose = require("mongoose");
require("dotenv").config();

// Robust connection options for handling heavy background processing
const connectOptions = {
  serverSelectionTimeoutMS: 45000, // Wait 45s for the server to reply to any query
  socketTimeoutMS: 1200000,       // Allow up to 20 minutes for very large bulk inserts/deletes
  connectTimeoutMS: 45000,        // 45s for initial connection
  heartbeatFrequencyMS: 10000,    // Pulse every 10s to keep connection warm and healthy
};

mongoose.connect(process.env.MONGO_URL, connectOptions)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log("Mongo Error:", err));

module.exports = mongoose.connection;