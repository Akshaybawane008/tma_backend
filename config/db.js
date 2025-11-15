// config/db.js
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error("Please define the MONGO_URI environment variable inside vercel or .env");
}

// Global cache for serverless environments
let cached = global._mongooseCache || { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      // Keep the socket timeouts short for serverless so failures are fast
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // <-- fail fast (5s) if server selection fails
      socketTimeoutMS: 45000,
      // other options as needed
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    }).catch((err) => {
      // reset promise so next invocation can retry
      cached.promise = null;
      throw err;
    });
  }

  cached.conn = await cached.promise;
  global._mongooseCache = cached;
  return cached.conn;
}

module.exports = connectDB;
