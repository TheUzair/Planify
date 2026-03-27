import mongoose from "mongoose";

// Use DATABASE_URL from environment; falls back to local MongoDB for development
const MONGODB_URI =
  process.env.DATABASE_URL || "mongodb://localhost:27017/planify";


declare global {
  var mongoose: { conn: mongoose.Connection | null; promise: Promise<mongoose.Connection> | null };
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB(): Promise<mongoose.Connection> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI)
      .then((m) => m.connection);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
