import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../utils/logger.js";
dotenv.config();

if (!process.env.MONGODB_URL) {
  throw new Error("Please provide MONGODB_URL");
}

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error("Mongodb connect error", error);
    process.exit(1);
  }
}

export default connectDB;
