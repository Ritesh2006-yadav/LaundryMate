/**
 * Staff Authentication Controller
 * Handles staff login and session verification
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate JWT token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'hostel_laundry_secret_key',
    { expiresIn: '30d' }
  );
};

/**
 * @desc    Staff Login
 * @route   POST /api/staff/login
 * @access  Public
 */
export const staffLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Explicitly select password field
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Role check: Only staff or admin can log into the staff portal
    if (user.role !== 'staff' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only laundry staff can access this portal.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Current Staff Profile
 * @route   GET /api/staff/me
 * @access  Private (Staff only)
 */
export const getStaffProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
