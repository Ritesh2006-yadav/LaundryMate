import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken, COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    let body;
    try { body = await req.json(); } catch {
      return NextResponse.json({ success: false, message: 'Request body must be valid JSON.' }, { status: 400 });
    }

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const registrationNumber = typeof body.registrationNumber === 'string' ? body.registrationNumber.trim().toUpperCase() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const hostel = typeof body.hostel === 'string' ? body.hostel.trim() : '';
    const block = typeof body.block === 'string' ? body.block.trim() : '';
    const roomNumber = typeof body.roomNumber === 'string' ? body.roomNumber.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';

    if (!name || !registrationNumber || !email || !password || !hostel || !block || !roomNumber) {
      return NextResponse.json({ success: false, message: 'Name, registration number, email, password, hostel, block, and room are required.' }, { status: 400 });
    }
    if (name.length > 100 || registrationNumber.length > 50 || roomNumber.length > 20 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: 'Please check your name, registration number, email, or room number.' }, { status: 400 });
    }
    if (password.length < 8 || password.length > 72) {
      return NextResponse.json({ success: false, message: 'Password must be between 8 and 72 characters.' }, { status: 400 });
    }

    await connectDB();
    await User.init();
    const existing = await User.findOne({ $or: [{ email }, { registrationNumber }] }).select('email registrationNumber');
    if (existing) {
      return NextResponse.json({ success: false, message: existing.email === email ? 'An account with this email already exists.' : 'An account with this registration number already exists.' }, { status: 409 });
    }

    const user = await User.create({ name, registrationNumber, email, password, hostel, block, roomNumber, phone, role: 'student' });
    const token = signToken(user);
    const data = {
      id: user._id.toString(), name: user.name, email: user.email, role: user.role,
      registrationNumber: user.registrationNumber, hostel: user.hostel, block: user.block,
      roomNumber: user.roomNumber, phone: user.phone,
    };
    const response = NextResponse.json({ success: true, message: 'Student account created successfully.', data, user: data }, { status: 201 });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, path: '/',
    });
    return response;
  } catch (error) {
    console.error('Registration API error:', error.message);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      return NextResponse.json({ success: false, message: field === 'registrationNumber' ? 'An account with this registration number already exists.' : 'An account with this email already exists.' }, { status: 409 });
    }
    if (error.name === 'ValidationError') {
      return NextResponse.json({ success: false, message: Object.values(error.errors).map((item) => item.message).join(' ') }, { status: 400 });
    }
    const status = /Mongo|server selection|timed out/i.test(error.name + error.message) ? 503 : 500;
    return NextResponse.json({ success: false, message: status === 503 ? 'Database is temporarily unavailable. Please try again.' : 'Unable to create your account right now.' }, { status });
  }
}
