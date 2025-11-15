// config/db.js
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error("Please define the MONGO_URI environment variable");
}

// Global cached connection across lambda invocations (serverless)
let cached = global._mongooseCache || { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      // fail fast on server selection if DB unreachable
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5s -> fail fast
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGO_URI, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      })
      .catch((err) => {
        // reset so next invocation can retry
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  global._mongooseCache = cached;
  return cached.conn;
}

module.exports = connectDB;
