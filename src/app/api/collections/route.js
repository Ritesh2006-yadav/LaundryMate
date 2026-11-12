import { apiError } from '@/lib/api-error';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const auth = await requireAuth(req, ['staff', 'admin']);
    if (!auth.authenticated) return auth.errorResponse;

    await connectDB();
    const { searchParams } = new URL(req.url);

    const hostel = searchParams.get('hostel');
    const block = searchParams.get('block');
    const status = searchParams.get('status') || '';

    const studentFilter = {};
    if (hostel) studentFilter.hostel = hostel;
    if (block) studentFilter.block = block;

    let studentIds = null;
    if (hostel || block) {
      const students = await User.find(studentFilter).select('_id');
      studentIds = students.map((s) => s._id);
    }

    const orderFilter = {};
    if (studentIds) {
      orderFilter.student = { $in: studentIds };
    }

    // Default to collection-relevant statuses if not specified
    if (status) {
      orderFilter.status = status;
    } else {
      orderFilter.status = { $in: ['Request Submitted', 'Pickup Scheduled', 'Clothes Collected'] };
    }

    const orders = await Order.find(orderFilter)
      .populate('student', 'name registrationNumber hostel block roomNumber phone')
      .sort({ 'student.roomNumber': 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (err) {
    console.error('Collections API error:', err);
    return apiError(err, 'Error fetching collections');
  }
}
