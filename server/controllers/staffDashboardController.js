/**
 * Staff Dashboard Controller
 * Computes live metrics for the 6 staff dashboard cards
 */

import Order from '../models/Order.js';
import Complaint from '../models/Complaint.js';

/**
 * @desc    Get Staff Dashboard Overview Metrics
 * @route   GET /api/staff/dashboard
 * @access  Private (Staff only)
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      todaysNewOrdersCount,
      toCollectCount,
      washingCount,
      readyToDeliverCount,
      unpaidOrdersCount,
      openComplaintsCount,
      recentOrders,
    ] = await Promise.all([
      // 1. Today's New Orders (placed today)
      Order.countDocuments({
        createdAt: { $gte: todayStart },
      }),

      // 2. To Collect (Waiting at student room / placed)
      Order.countDocuments({
        status: 'Placed',
      }),

      // 3. Washing (Currently in laundry machines)
      Order.countDocuments({
        status: 'Washing',
      }),

      // 4. Ready to Deliver (Cleaned and packed, ready for delivery)
      Order.countDocuments({
        status: 'Ready',
      }),

      // 5. Unpaid Orders (Unpaid or partly paid orders)
      Order.countDocuments({
        'payment.status': { $in: ['Unpaid', 'Partly Paid'] },
      }),

      // 6. Open Complaints (Student issues needing attention)
      Complaint.countDocuments({
        status: { $in: ['Open', 'In Progress'] },
      }),

      // Recent 5 orders for fast glance
      Order.find()
        .populate('student', 'name roomNumber hostel block phone')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        cards: {
          todaysNewOrders: todaysNewOrdersCount,
          toCollect: toCollectCount,
          washing: washingCount,
          readyToDeliver: readyToDeliverCount,
          unpaidOrders: unpaidOrdersCount,
          openComplaints: openComplaintsCount,
        },
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};
