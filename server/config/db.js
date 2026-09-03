import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

export default async function connectDB() {
  let mongoUri = process.env.MONGO_URI;

  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      console.log("MongoDB connected");
      return;
    } catch (error) {
      if (mongoUri.startsWith("mongodb+srv://")) {
        throw new Error(`MongoDB Atlas connection failed: ${error.message}`);
      }
      console.warn(`MongoDB unavailable (${error.code || error.message}); using in-memory MongoDB.`);
      await mongoose.disconnect();
    }
  }

  const memoryServer = await MongoMemoryServer.create({
    binary: { version: process.env.MONGOMS_VERSION || "5.0.19" },
  });
  mongoUri = memoryServer.getUri();
  process.env.MONGO_URI = mongoUri;
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
  console.log("MongoDB connected");
}
