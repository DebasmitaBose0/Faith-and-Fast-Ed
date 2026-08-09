import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';
dotenv.config();

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

if (!process.env.MONGODB_URL) {
  throw new Error('Please provide MONGODB_URL');
}

mongoose.connection.on("disconnected", () => {
  console.warn("[MongoDB] Disconnected from database");
});

mongoose.connection.on("error", (err) => {
  console.error(`[MongoDB] Connection error: ${err.message}`);
});

async function connectDB(retryCount = 0) {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);

    if (retryCount < MAX_RETRIES) {
      console.log(
        `Retrying connection in ${RETRY_DELAY / 1000}s... (attempt ${retryCount + 1}/${MAX_RETRIES})`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return connectDB(retryCount + 1);
    }

    console.error("Max retries reached. Exiting.");
    process.exit(1);
  }
}

export default connectDB;
