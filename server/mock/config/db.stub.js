/**
 * MOCK STUB: Database Connection
 * OWNED BY: Member 3
 * PURPOSE: Provides MongoDB Atlas connection. This mock establishes a connection
 * using mongoose if MONGO_URI is set, or logs a fallback message for offline development.
 */

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.warn('⚠️ [MOCK DB]: MONGO_URI is not defined in environment variables.');
      console.warn('⚠️ [MOCK DB]: Member 3 should provide MongoDB Atlas credentials in .env');
      return;
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ [MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ [MOCK DB Error]: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
