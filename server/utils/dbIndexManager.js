import mongoose from "mongoose";
import logger from "./logger.js";

async function ensureIndexes() {
  const db = mongoose.connection.db;
  if (!db) {
    logger.warn("Database not connected, skipping index verification");
    return;
  }

  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map((c) => c.name);

  logger.info(
    `Index verification: available collections: ${collectionNames.join(", ")}`
  );
}

async function getIndexStats() {
  const db = mongoose.connection.db;
  if (!db) {
    return { error: "Database not connected" };
  }

  const collections = await db.listCollections().toArray();
  const stats = [];

  for (const collection of collections) {
    const indexes = await db
      .collection(collection.name)
      .indexes();
    stats.push({
      collection: collection.name,
      indexCount: indexes.length,
      indexes: indexes.map((idx) => ({
        name: idx.name,
        key: idx.key,
        unique: idx.unique || false,
      })),
    });
  }

  return stats;
}

export { ensureIndexes, getIndexStats };
