import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is not defined in environment variables");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn; // Use existing connection
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        maxPoolSize: 10, // Set connection pool size to 10
        minPoolSize: 5,  // Maintain at least 5 connections
        serverSelectionTimeoutMS: 5000, // Timeout after 5s if no server found
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      })
      .then((mongoose) => {
        console.log("✅ MongoDB Connected");
        return mongoose;
      })
      .catch((error) => {
        console.error("❌ MongoDB Connection Failed:", error);
        process.exit(1); // Exit process if connection fails
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;
