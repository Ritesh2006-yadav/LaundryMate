import { apiError } from '@/lib/api-error';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireAuth } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    const auth = await requireAuth(req);
    if (!auth.authenticated) return auth.errorResponse;

    await connectDB();
    const { user } = auth;
    const { id } = params;

    const order = await Order.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderId: id }],
    }).populate('student', 'name registrationNumber hostel block roomNumber phone email');

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Role check: Student can only view their own order
    if (user.role === 'student' && order.student._id.toString() !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Access denied. You can only view your own orders.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (err) {
    return apiError(err, 'Error fetching order');
  }
}

export async function PATCH(req, { params }) {
  try {
    const auth = await requireAuth(req, ['staff', 'admin']);
    if (!auth.authenticated) return auth.errorResponse;

    await connectDB();
    const { id } = params;
    const body = await req.json();

    const order = await Order.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderId: id }] },
      { $set: body },
      { new: true }
    ).populate('student', 'name registrationNumber hostel block roomNumber phone email');

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      data: order,
    });
  } catch (err) {
    return apiError(err, 'Error updating order');
  }
}
