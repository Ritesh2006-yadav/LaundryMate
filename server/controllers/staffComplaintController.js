/**
 * Staff Complaint Controller
 * Handles viewing student laundry complaints, drafting replies, and marking them resolved
 */

import Complaint from '../models/Complaint.js';

/**
 * @desc    Get All Complaints with status filter
 * @route   GET /api/staff/complaints
 * @access  Private (Staff only)
 */
export const getComplaints = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status && ['Open', 'In Progress', 'Resolved'].includes(status)) {
      query.status = status;
    }

    const complaints = await Complaint.find(query)
      .populate('student', 'name email phone hostel block roomNumber')
      .populate('order', 'orderNumber status createdAt isPremium')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Single Complaint by ID
 * @route   GET /api/staff/complaints/:id
 * @access  Private (Staff only)
 */
export const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('student', 'name email phone hostel block roomNumber')
      .populate('order');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Respond to a complaint & optionally resolve it
 * @route   PUT /api/staff/complaints/:id/respond
 * @access  Private (Staff only)
 */
export const respondToComplaint = async (req, res, next) => {
  try {
    const { staffResponse, status } = req.body;

    if (!staffResponse || staffResponse.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a response message for the student.',
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    const newStatus = status || 'Resolved';

    complaint.staffResponse = staffResponse.trim();
    complaint.status = newStatus;

    if (newStatus === 'Resolved') {
      complaint.resolvedAt = new Date();
      complaint.resolvedBy = {
        id: req.user._id,
        name: req.user.name,
      };
    }

    await complaint.save();

    const updated = await Complaint.findById(complaint._id)
      .populate('student', 'name email phone hostel block roomNumber')
      .populate('order');

    res.status(200).json({
      success: true,
      message: `Complaint marked as "${newStatus}".`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
