import { apiError } from '@/lib/api-error';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import { requireAuth } from '@/lib/auth';

export async function PATCH(req, { params }) {
  try {
    const auth = await requireAuth(req, ['staff', 'admin']);
    if (!auth.authenticated) return auth.errorResponse;

    await connectDB();
    const { user } = auth;
    const { id } = params;
    const body = await req.json();

    const { staffResponse, status } = body;

    if (!staffResponse || staffResponse.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Please provide a response message for the student' },
        { status: 400 }
      );
    }

    const complaint = await Complaint.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { complaintId: id }],
    });

    if (!complaint) {
      return NextResponse.json(
        { success: false, message: 'Complaint not found' },
        { status: 404 }
      );
    }

    const newStatus = status || 'Resolved';

    complaint.staffResponse = staffResponse.trim();
    complaint.status = newStatus;

    if (newStatus === 'Resolved') {
      complaint.resolvedAt = new Date();
      complaint.resolvedBy = {
        id: user.id,
        name: user.name,
      };
    }

    await complaint.save();

    const updated = await Complaint.findById(complaint._id)
      .populate('student', 'name registrationNumber hostel block roomNumber phone email')
      .populate('order', 'orderId status');

    return NextResponse.json({
      success: true,
      message: `Complaint updated to "${newStatus}"`,
      data: updated,
    });
  } catch (err) {
    console.error('Respond complaint error:', err);
    return apiError(err, 'Error responding to complaint');
  }
}
