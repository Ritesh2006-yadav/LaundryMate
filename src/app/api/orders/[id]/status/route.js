import { apiError } from '@/lib/api-error';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order, { ORDER_STATUSES } from '@/models/Order';
import { requireAuth } from '@/lib/auth';

export async function PATCH(req, { params }) {
  try {
    const auth = await requireAuth(req, ['staff', 'admin']);
    if (!auth.authenticated) return auth.errorResponse;

    await connectDB();
    const { user } = auth;
    const { id } = params;
    const body = await req.json();

    const { status, note = '', estimatedDelivery } = body;

    if (!status || !ORDER_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, message: `Invalid status. Valid statuses: ${ORDER_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const order = await Order.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderId: id }],
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    const previousStatus = order.status;
    order.status = status;

    if (estimatedDelivery !== undefined) {
      order.estimatedDelivery = estimatedDelivery;
    }

    // Append to status history
    order.statusHistory.push({
      previousStatus,
      newStatus: status,
      updatedBy: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
      changedAt: new Date(),
      note: note.trim(),
    });

    await order.save();

    const updated = await Order.findById(order._id).populate(
      'student',
      'name registrationNumber hostel block roomNumber phone email'
    );

    return NextResponse.json({
      success: true,
      message: `Status updated from "${previousStatus}" to "${status}"`,
      data: updated,
    });
  } catch (err) {
    console.error('Update status error:', err);
    return apiError(err, 'Error updating order status');
  }
}
