const mongoose = require("mongoose");
const logger = require("../utils/logger");

/**
 * Connects to MongoDB using Mongoose.
 * Exits the process on failure to prevent running without a DB.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown on SIGINT (Ctrl+C)
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  logger.info("MongoDB connection closed due to app termination.");
  process.exit(0);
});

module.exports = connectDB;
