import { apiError } from '@/lib/api-error';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireAuth } from '@/lib/auth';
import { calculateOrderPrice } from '@/lib/pricing';

export async function PATCH(req, { params }) {
  try {
    const auth = await requireAuth(req, ['staff', 'admin']);
    if (!auth.authenticated) return auth.errorResponse;

    await connectDB();
    const { user } = auth;
    const { id } = params;
    const body = await req.json();

    const { collectedItems = [], staffNotes = '', collectionDate } = body;

    const order = await Order.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderId: id }],
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    let hasDiscrepancy = false;

    // Update collected count on each item
    order.items = order.items.map((item) => {
      const match = collectedItems.find(
        (ci) => ci._id?.toString() === item._id?.toString() || ci.clothingType === item.clothingType
      );

      const collectedCount = match ? Number(match.collectedCount) : item.requestedCount;
      if (collectedCount !== item.requestedCount) {
        hasDiscrepancy = true;
      }

      item.collectedCount = collectedCount;
      return item;
    });

    // Update collection details
    order.collectionDetails = {
      collectedBy: {
        id: user.id,
        name: user.name,
      },
      collectedAt: collectionDate ? new Date(collectionDate) : new Date(),
      countDiscrepancy: hasDiscrepancy,
      staffNotes: staffNotes.trim(),
    };

    // Auto-advance status if currently 'Request Submitted' or 'Pickup Scheduled'
    const prevStatus = order.status;
    if (['Request Submitted', 'Pickup Scheduled'].includes(order.status)) {
      order.status = 'Clothes Collected';
      order.statusHistory.push({
        previousStatus: prevStatus,
        newStatus: 'Clothes Collected',
        updatedBy: { id: user.id, name: user.name, role: user.role },
        changedAt: new Date(),
        note: `Collection verified by staff. ${hasDiscrepancy ? 'Discrepancy detected.' : 'All items matched.'}`,
      });
    }

    // Recalculate price based on collected garments if any
    const pricing = calculateOrderPrice(
      order.items.map((it) => ({
        ...it.toObject(),
        requestedCount: it.collectedCount > 0 ? it.collectedCount : it.requestedCount,
      })),
      order.isPremium
    );

    order.payment.totalAmount = pricing.totalAmount;
    order.payment.balance = Math.max(0, pricing.totalAmount - (order.payment.paidAmount || 0));
    if (order.payment.balance === 0 && order.payment.paidAmount > 0) {
      order.payment.status = 'Paid';
    } else if (order.payment.paidAmount > 0) {
      order.payment.status = 'Partially Paid';
    }

    await order.save();

    const updated = await Order.findById(order._id).populate(
      'student',
      'name registrationNumber hostel block roomNumber phone email'
    );

    return NextResponse.json({
      success: true,
      message: 'Collection recorded successfully',
      data: updated,
    });
  } catch (err) {
    console.error('Record collection error:', err);
    return apiError(err, 'Error recording collection');
  }
}
