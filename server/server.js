/**
 * Hostel Laundry Management System - Backend Server
 * Member 2: Staff Portal APIs
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import staffRoutes from './routes/staffRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas (provided by Member 3 or Mock Stub)
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hostel Laundry Management Staff API is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Mount Staff Routes
app.use('/api/staff', staffRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 LaundryMate Staff Server running on http://localhost:${PORT}`);
  console.log(`📦 Staff API endpoints available at http://localhost:${PORT}/api/staff`);
});

export default app;
