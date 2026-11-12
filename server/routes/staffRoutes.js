/**
 * Staff Routes
 * Base Path: /api/staff
 * All staff operations are protected by protect + authorizeRoles('staff', 'admin')
 */

import express from 'express';
import {
  staffLogin,
  getStaffProfile,
} from '../controllers/staffAuthController.js';
import { getDashboardStats } from '../controllers/staffDashboardController.js';
import {
  getOrders,
  getOrderById,
  recordCollection,
  updateOrderStatus,
  managePayment,
} from '../controllers/staffOrderController.js';
import {
  getComplaints,
  getComplaintById,
  respondToComplaint,
} from '../controllers/staffComplaintController.js';
import { getFilterOptions } from '../controllers/staffFilterController.js';

import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Authentication
router.post('/login', staffLogin);

// Protected Staff Routes
router.use(protect);
router.use(authorizeRoles('staff', 'admin'));

// 2. Staff Profile
router.get('/me', getStaffProfile);

// 3. Dashboard Overview
router.get('/dashboard', getDashboardStats);

// 4. Multi-level Filters
router.get('/filters', getFilterOptions);

// 5. Orders Management
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/collection', recordCollection);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/payment', managePayment);

// 6. Complaints Management
router.get('/complaints', getComplaints);
router.get('/complaints/:id', getComplaintById);
router.put('/complaints/:id/respond', respondToComplaint);

export default router;
