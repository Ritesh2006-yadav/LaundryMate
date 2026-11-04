import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI (or MONGO_URI) in .env.local');
}

if (!/^mongodb(?:\+srv)?:\/\//.test(MONGODB_URI)) {
  throw new Error('MONGODB_URI must start with mongodb:// or mongodb+srv://');
}

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

export default async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 12000,
      socketTimeoutMS: 45000,
    }).then((instance) => {
      console.info(`MongoDB connected: ${instance.connection.name}`);
      return instance;
    }).catch((error) => {
      cached.promise = null;
      console.error('MongoDB connection failed:', error.message);
      throw error;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
