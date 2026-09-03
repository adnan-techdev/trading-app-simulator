import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

export default async function connectDB() {
  let mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    const memoryServer = await MongoMemoryServer.create();
    mongoUri = memoryServer.getUri();
    process.env.MONGO_URI = mongoUri;
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
}
