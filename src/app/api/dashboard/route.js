import { apiError } from '@/lib/api-error';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Complaint from '@/models/Complaint';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (!auth.authenticated) return auth.errorResponse;

    await connectDB();
    const { user } = auth;

    if (user.role === 'student') {
      const studentId = user.id;

      const [totalOrders, activeOrders, readyForDelivery, pendingPayments, recentOrders] =
        await Promise.all([
          Order.countDocuments({ student: studentId }),
          Order.countDocuments({
            student: studentId,
            status: { $in: ['Request Submitted', 'Pickup Scheduled', 'Clothes Collected', 'Processing', 'Out for Delivery'] },
          }),
          Order.countDocuments({
            student: studentId,
            status: 'Ready for Delivery',
          }),
          Order.countDocuments({
            student: studentId,
            'payment.status': { $in: ['Pending', 'Unpaid', 'Partially Paid'] },
          }),
          Order.find({ student: studentId })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),
        ]);

      return NextResponse.json({
        success: true,
        role: 'student',
        stats: {
          totalOrders,
          activeOrders,
          readyForDelivery,
          pendingPayments,
        },
        recentOrders,
      });
    }

    // Staff Dashboard metrics
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      todaysNewRequests,
      pendingCollections,
      processingCount,
      premiumOrdersCount,
      readyForDeliveryCount,
      pendingPaymentsCount,
      openComplaintsCount,
      recentOrders,
    ] = await Promise.all([
      // Total orders in system
      Order.countDocuments(),
      // Today's new requests
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
      // Pending collections (Request Submitted or Pickup Scheduled)
      Order.countDocuments({ status: { $in: ['Request Submitted', 'Pickup Scheduled'] } }),
      // Clothes currently processing
      Order.countDocuments({ status: 'Processing' }),
      // Premium dry cleaning orders
      Order.countDocuments({ isPremium: true }),
      // Ready for delivery
      Order.countDocuments({ status: 'Ready for Delivery' }),
      // Pending payments
      Order.countDocuments({ 'payment.status': { $in: ['Pending', 'Unpaid', 'Partially Paid'] } }),
      // Open complaints
      Complaint.countDocuments({ status: { $in: ['Open', 'In Progress'] } }),
      // Recent orders for quick preview
      Order.find()
        .populate('student', 'name registrationNumber hostel block roomNumber phone')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      role: 'staff',
      stats: {
        totalOrders,
        todaysNewRequests,
        pendingCollections,
        processingCount,
        premiumOrdersCount,
        readyForDeliveryCount,
        pendingPaymentsCount,
        openComplaintsCount,
      },
      recentOrders,
    });
  } catch (err) {
    console.error('Dashboard metrics error:', err);
    return apiError(err, 'Error fetching dashboard metrics');
  }
}
