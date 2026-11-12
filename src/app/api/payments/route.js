import { apiError } from '@/lib/api-error';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Order from '@/models/Order';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (!auth.authenticated) return auth.errorResponse;

    await connectDB();
    const { user } = auth;
    const { searchParams } = new URL(req.url);

    const query = {};

    // If student, only their payments
    if (user.role === 'student') {
      query.student = user.id;
    } else {
      // Staff filter options
      const status = searchParams.get('status');
      const method = searchParams.get('method');
      if (status) query.paymentStatus = status;
      if (method) query.paymentMethod = method;
    }

    const payments = await Payment.find(query)
      .populate('order', 'orderId status items serviceType')
      .populate('student', 'name registrationNumber hostel block roomNumber phone email')
      .populate('receivedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: payments,
    });
  } catch (err) {
    console.error('Fetch payments error:', err);
    return apiError(err, 'Error fetching payments');
  }
}

export async function POST(req) {
  try {
    const auth = await requireAuth(req, ['staff', 'admin']);
    if (!auth.authenticated) return auth.errorResponse;

    await connectDB();
    const { user } = auth;
    const body = await req.json();

    const {
      orderId,
      amount,
      paymentMethod = 'Cash',
      transactionRef = '',
      notes = '',
      verified = false,
    } = body;

    if (!orderId || !amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide valid order ID and positive payment amount' },
        { status: 400 }
      );
    }

    // Must be verified
    if (!verified) {
      return NextResponse.json(
        { success: false, message: 'Payment verification is required before recording' },
        { status: 400 }
      );
    }

    const order = await Order.findOne({
      $or: [{ _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }, { orderId }],
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    const paidNumber = Number(amount);
    const newPaidTotal = (order.payment.paidAmount || 0) + paidNumber;
    const newBalance = Math.max(0, order.payment.totalAmount - newPaidTotal);

    let newStatus = 'Partially Paid';
    if (newBalance === 0) {
      newStatus = 'Paid';
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const paymentNumber = `PAY-${new Date().getFullYear()}-${randomSuffix}`;

    const newPayment = await Payment.create({
      paymentId: paymentNumber,
      order: order._id,
      student: order.student,
      totalAmount: order.payment.totalAmount,
      amountPaid: paidNumber,
      remainingBalance: newBalance,
      paymentMethod,
      transactionRef: transactionRef.trim(),
      paymentStatus: newStatus === 'Paid' ? 'Paid' : 'Partially Paid',
      receivedBy: user.id,
      notes: notes.trim(),
    });

    // Update order payment status
    order.payment.paidAmount = newPaidTotal;
    order.payment.balance = newBalance;
    order.payment.status = newStatus;
    order.payment.paymentMethod = paymentMethod;
    order.payment.paymentHistory.push(newPayment._id);

    await order.save();

    return NextResponse.json({
      success: true,
      message: `Payment of ₹${paidNumber} recorded successfully!`,
      data: newPayment,
    });
  } catch (err) {
    console.error('Record payment error:', err);
    return apiError(err, 'Error recording payment');
  }
}
