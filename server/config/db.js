// /**
//  * Database Connection Bridge
//  * Real file owned by: Member 3
//  * Points to mock stub until Member 3 replaces it with real Atlas connection.
//  */

// import connectDB from '../mock/config/db.stub.js';

// export default connectDB;

import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is missing in .env file');
        }

        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('MongoDB Connection Failed:', error.message);
        process.exit(1);
    }
};

export default connectDB;
