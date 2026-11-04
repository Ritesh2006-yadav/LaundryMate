import { apiError } from '@/lib/api-error';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import Order from '@/models/Order';
import User from '@/models/User';
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

    // If student, strictly fetch their own complaints
    if (user.role === 'student') {
      query.student = user.id;
    } else {
      // Staff filter
      const status = searchParams.get('status');
      const search = searchParams.get('search');

      if (status && ['Open', 'In Progress', 'Resolved'].includes(status)) {
        query.status = status;
      }

      if (search) {
        const searchRegex = { $regex: search.trim(), $options: 'i' };
        const students = await User.find({
          $or: [{ name: searchRegex }, { registrationNumber: searchRegex }, { email: searchRegex }],
        }).select('_id');

        const orders = await Order.find({ orderId: searchRegex }).select('_id');

        query.$or = [
          { complaintId: searchRegex },
          { student: { $in: students.map((s) => s._id) } },
          { order: { $in: orders.map((o) => o._id) } },
        ];
      }
    }

    const complaints = await Complaint.find(query)
      .populate('student', 'name registrationNumber hostel block roomNumber phone email')
      .populate('order', 'orderId status isPremium serviceType items createdAt')
      .populate('resolvedBy.id', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: complaints,
    });
  } catch (err) {
    console.error('Fetch complaints error:', err);
    return apiError(err, 'Error fetching complaints');
  }
}

export async function POST(req) {
  try {
    const auth = await requireAuth(req);
    if (!auth.authenticated) return auth.errorResponse;

    await connectDB();
    const { user } = auth;
    const body = await req.json();

    const { orderId, category, description, imageUrl = '' } = body;

    if (!category || !description) {
      return NextResponse.json(
        { success: false, message: 'Please provide both category and description' },
        { status: 400 }
      );
    }

    let orderRef = null;
    if (orderId) {
      const foundOrder = await Order.findOne({
        $or: [{ _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }, { orderId }],
      });
      if (foundOrder) {
        orderRef = foundOrder._id;
      }
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const complaintId = `CMP-${new Date().getFullYear()}-${randomSuffix}`;

    const newComplaint = await Complaint.create({
      complaintId,
      student: user.id,
      order: orderRef,
      category,
      description: description.trim(),
      imageUrl: imageUrl || '',
      status: 'Open',
    });

    const populated = await Complaint.findById(newComplaint._id)
      .populate('student', 'name registrationNumber hostel block roomNumber')
      .populate('order', 'orderId status');

    return NextResponse.json(
      {
        success: true,
        message: 'Complaint registered successfully! Our staff will review it.',
        data: populated,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Create complaint error:', err);
    return apiError(err, 'Error registering complaint');
  }
}
