/**
 * Staff Order Controller
 * Handles order listing, filtering, collection counting, status workflow, and payments
 */

import Order from '../models/Order.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import { calculatePrice } from '../utils/calculatePrice.js';

// Strict lifecycle progression
const STATUS_STEPS = ['Placed', 'Collected', 'Washing', 'Ready', 'Delivered'];

/**
 * @desc    Get All Orders with Multi-filter & Search & Pagination
 * @route   GET /api/staff/orders
 * @access  Private (Staff only)
 */
export const getOrders = async (req, res, next) => {
  try {
    const {
      hostel,
      block,
      room,
      status,
      payment,
      premium,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // 1. Direct Order Filters
    if (status && STATUS_STEPS.includes(status)) {
      query.status = status;
    }

    if (payment && ['Unpaid', 'Partly Paid', 'Paid'].includes(payment)) {
      query['payment.status'] = payment;
    }

    if (premium !== undefined && premium !== '') {
      query.isPremium = premium === 'true';
    }

    // 2. Student Sub-document / Population Filters (hostel, block, room, search by student name)
    const studentFilter = {};
    if (hostel) studentFilter.hostel = hostel;
    if (block) studentFilter.block = block;
    if (room) studentFilter.roomNumber = room;

    let matchingStudentIds = null;

    if (hostel || block || room || search) {
      if (search) {
        studentFilter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ];
      }

      const students = await User.find(studentFilter).select('_id');
      matchingStudentIds = students.map((s) => s._id);

      // If search was provided, it could be either student name or orderNumber
      if (search) {
        query.$or = [
          { orderNumber: { $regex: search, $options: 'i' } },
          { student: { $in: matchingStudentIds } },
        ];
      } else {
        query.student = { $in: matchingStudentIds };
      }
    }

    // 3. Pagination & Count
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limitNum) || 1;

    const orders = await Order.find(query)
      .populate('student', 'name email phone hostel block roomNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          totalOrders,
          totalPages,
          currentPage: pageNum,
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Single Order Details
 * @route   GET /api/staff/orders/:id
 * @access  Private (Staff only)
 */
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('student', 'name email phone hostel block roomNumber')
      .populate({
        path: 'payment.paymentHistory',
        populate: { path: 'receivedBy', select: 'name email' },
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Record Collected Clothing Quantity
 * @route   PUT /api/staff/orders/:id/collection
 * @access  Private (Staff only)
 */
export const recordCollection = async (req, res, next) => {
  try {
    const { items, staffNotes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide collected item counts for this order.',
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Merge collected counts into order items
    let totalRequested = 0;
    let totalCollected = 0;
    let hasPremium = false;

    // Map through the submitted items
    order.items = items.map((submitted) => {
      const existing = order.items.find(
        (i) => i.clothingType === submitted.clothingType || i._id.toString() === submitted._id
      );

      const requestedCount = existing ? existing.requestedCount : submitted.requestedCount || 0;
      const collectedCount = Math.max(0, parseInt(submitted.collectedCount, 10) || 0);
      const isPremium = submitted.isPremium !== undefined ? Boolean(submitted.isPremium) : (existing?.isPremium || false);

      totalRequested += requestedCount;
      totalCollected += collectedCount;
      if (isPremium) hasPremium = true;

      return {
        clothingType: submitted.clothingType || existing?.clothingType || 'Clothing item',
        requestedCount,
        collectedCount,
        isPremium,
        specialInstructions: submitted.specialInstructions || existing?.specialInstructions || '',
      };
    });

    // Check discrepancy
    const countDiscrepancy = totalRequested !== totalCollected;

    order.collectionDetails = {
      collectedBy: {
        id: req.user._id,
        name: req.user.name,
      },
      collectedAt: new Date(),
      countDiscrepancy,
      staffNotes: staffNotes || '',
    };

    order.isPremium = hasPremium;

    // Recalculate price using Member 3's pricing helper
    const pricing = calculatePrice(order);
    order.payment.totalAmount = pricing.totalAmount;
    order.payment.balance = Math.max(0, pricing.totalAmount - (order.payment.paidAmount || 0));

    if (order.payment.balance === 0 && order.payment.totalAmount > 0) {
      order.payment.status = 'Paid';
    } else if (order.payment.paidAmount > 0) {
      order.payment.status = 'Partly Paid';
    } else {
      order.payment.status = 'Unpaid';
    }

    // If order was in 'Placed' state, advance to 'Collected'
    if (order.status === 'Placed') {
      order.status = 'Collected';
      order.statusHistory.push({
        status: 'Collected',
        changedAt: new Date(),
        changedBy: { id: req.user._id, name: req.user.name },
        note: `Collection verified. ${totalCollected} items counted.`,
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Clothing collection successfully recorded.',
      data: order,
      countDiscrepancy,
      discrepancyWarning: countDiscrepancy
        ? `Warning: Student requested ${totalRequested} items, but staff counted ${totalCollected} items.`
        : null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Advance Order Status (Placed -> Collected -> Washing -> Ready -> Delivered)
 * @route   PUT /api/staff/orders/:id/status
 * @access  Private (Staff only)
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status: nextStatus, note } = req.body;

    if (!nextStatus || !STATUS_STEPS.includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: `Please specify a valid status: ${STATUS_STEPS.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    const currentIndex = STATUS_STEPS.indexOf(order.status);
    const targetIndex = STATUS_STEPS.indexOf(nextStatus);

    // Strict validation: Reject skipped or backward steps
    if (targetIndex !== currentIndex + 1) {
      const allowedNext = STATUS_STEPS[currentIndex + 1];
      if (!allowedNext) {
        return res.status(400).json({
          success: false,
          message: `Order is already completed at "${order.status}". No further status changes are permitted.`,
        });
      }
      return res.status(400).json({
        success: false,
        message: `Cannot jump from "${order.status}" to "${nextStatus}". The only allowed next step is "${allowedNext}".`,
      });
    }

    // Update status and history
    order.status = nextStatus;
    order.statusHistory.push({
      status: nextStatus,
      changedAt: new Date(),
      changedBy: { id: req.user._id, name: req.user.name },
      note: note || `Status updated to ${nextStatus}`,
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order successfully updated to "${nextStatus}".`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Manage and Record Order Payment
 * @route   PUT /api/staff/orders/:id/payment
 * @access  Private (Staff only)
 */
export const managePayment = async (req, res, next) => {
  try {
    const { amount, paymentMethod, transactionRef, notes } = req.body;

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount must be greater than 0.',
      });
    }

    if (!paymentMethod || !['Cash', 'UPI', 'Other'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Payment method must be Cash, UPI, or Other.',
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Create payment entry in Member 3's Payment collection
    const paymentNumber = `PAY-${Date.now().toString().slice(-6)}`;
    const paymentRecord = await Payment.create({
      paymentNumber,
      order: order._id,
      student: order.student,
      amount: numAmount,
      paymentMethod,
      transactionRef: transactionRef || '',
      receivedBy: req.user._id,
      notes: notes || '',
    });

    // Update order payment balances
    const newPaidAmount = (order.payment.paidAmount || 0) + numAmount;
    const newBalance = Math.max(0, (order.payment.totalAmount || 0) - newPaidAmount);

    let newStatus = 'Unpaid';
    if (newBalance === 0 && order.payment.totalAmount > 0) {
      newStatus = 'Paid';
    } else if (newPaidAmount > 0) {
      newStatus = 'Partly Paid';
    }

    order.payment.paidAmount = newPaidAmount;
    order.payment.balance = newBalance;
    order.payment.status = newStatus;
    order.payment.paymentHistory.push(paymentRecord._id);

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('student', 'name email phone hostel block roomNumber')
      .populate({
        path: 'payment.paymentHistory',
        populate: { path: 'receivedBy', select: 'name email' },
      });

    res.status(200).json({
      success: true,
      message: `Payment of ₹${numAmount} successfully recorded via ${paymentMethod}.`,
      data: {
        order: populatedOrder,
        latestPayment: paymentRecord,
      },
    });
  } catch (error) {
    next(error);
  }
};
