import { apiError } from '@/lib/api-error';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';
import { calculateOrderPrice } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (!auth.authenticated) return auth.errorResponse;

    await connectDB();
    const { user } = auth;
    const { searchParams } = new URL(req.url);

    // If student, strictly filter by their own user ID
    if (user.role === 'student') {
      const orders = await Order.find({ student: user.id })
        .populate('student', 'name registrationNumber hostel block roomNumber phone')
        .sort({ createdAt: -1 })
        .lean();

      return NextResponse.json({
        success: true,
        data: orders,
      });
    }

    // Staff view: Multi-level filters
    const hostel = searchParams.get('hostel');
    const block = searchParams.get('block');
    const room = searchParams.get('room');
    const status = searchParams.get('status');
    const payment = searchParams.get('payment');
    const premium = searchParams.get('premium');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const query = {};

    if (status) query.status = status;
    if (payment) query['payment.status'] = payment;
    if (premium !== null && premium !== undefined && premium !== '') {
      query.isPremium = premium === 'true';
    }

    // Match student attributes (hostel, block, room, name, regNo)
    const studentQuery = {};
    if (hostel) studentQuery.hostel = hostel;
    if (block) studentQuery.block = block;
    if (room) studentQuery.roomNumber = room;

    if (search) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      // Check if search matches orderId directly
      if (search.toUpperCase().startsWith('ORD-') || search.toUpperCase().startsWith('LDR-')) {
        query.orderId = searchRegex;
      } else {
        studentQuery.$or = [
          { name: searchRegex },
          { registrationNumber: searchRegex },
          { email: searchRegex },
          { roomNumber: searchRegex },
        ];
      }
    }

    if (Object.keys(studentQuery).length > 0) {
      const matchedStudents = await User.find(studentQuery).select('_id');
      const studentIds = matchedStudents.map((s) => s._id);

      if (query.orderId) {
        // If orderId was also matched, do an $and or $or
      } else {
        query.student = { $in: studentIds };
      }
    }

    const totalCount = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('student', 'name registrationNumber hostel block roomNumber phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    });
  } catch (err) {
    console.error('Fetch orders error:', err);
    return apiError(err, 'Error fetching orders');
  }
}

export async function POST(req) {
  try {
    const auth = await requireAuth(req, ['student', 'staff', 'admin']);
    if (!auth.authenticated) return auth.errorResponse;

    await connectDB();
    const { user } = auth;
    const body = await req.json();

    const {
      items,
      serviceType = 'regular',
      isPremium = false,
      specialInstructions = '',
      photos = [],
      pickupPreferences = {},
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please select at least one clothing item' },
        { status: 400 }
      );
    }

    const premiumFlag = Boolean(isPremium || serviceType === 'premium');
    const pricing = calculateOrderPrice(items, premiumFlag);

    // Generate unique order ID: e.g. ORD-2026-9281
    const orderData = {
      student: user.id,
      items: pricing.items,
      photos: photos || [],
      serviceType: premiumFlag ? 'premium' : 'regular',
      isPremium: premiumFlag,
      specialInstructions: specialInstructions || '',
      pickupPreferences: {
        pickupDate: pickupPreferences.pickupDate || new Date().toISOString().split('T')[0],
        pickupTime: pickupPreferences.pickupTime || '6:00 – 7:00 PM',
      },
      status: 'Request Submitted',
      statusHistory: [
        {
          previousStatus: '',
          newStatus: 'Request Submitted',
          updatedBy: { id: user.id, name: user.name, role: user.role },
          changedAt: new Date(),
          note: 'Request submitted by student',
        },
      ],
      payment: {
        totalAmount: pricing.totalAmount,
        paidAmount: 0,
        balance: pricing.totalAmount,
        status: 'Pending',
        paymentMethod: 'Cash / UPI at Delivery',
      },
    };

    // Order IDs have a unique index. Retry only when that index collides; never
    // interpret an order write conflict as an account registration conflict.
    let newOrder;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      try {
        newOrder = await Order.create({ ...orderData, orderId: `ORD-${new Date().getFullYear()}-${randomSuffix}` });
        break;
      } catch (err) {
        const duplicateOrderId = err?.code === 11000 && (err.keyPattern?.orderId || err.keyValue?.orderId);
        if (!duplicateOrderId || attempt === 4) throw err;
      }
    }

    const populated = await Order.findById(newOrder._id).populate(
      'student',
      'name registrationNumber hostel block roomNumber phone email'
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Laundry request submitted successfully!',
        data: populated,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Create order error:', err);
    return apiError(err, 'Error creating order');
  }
}
