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
    const identifier = String(body.identifier || body.email || body.registrationNumber || '').trim();
    const password = typeof body.password === 'string' ? body.password : '';
    if (!identifier || !password) {
      return NextResponse.json({ success: false, message: 'Enter your email or registration number and password.' }, { status: 400 });
    }

    await connectDB();
    const query = identifier.includes('@')
      ? { email: identifier.toLowerCase() }
      : { registrationNumber: identifier.toUpperCase() };
    const user = await User.findOne(query).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return NextResponse.json({ success: false, message: 'Invalid email/registration number or password.' }, { status: 401 });
    }

    const token = signToken(user);
    const data = {
      id: user._id.toString(), name: user.name, email: user.email, role: user.role,
      registrationNumber: user.registrationNumber || '', hostel: user.hostel || '',
      block: user.block || '', roomNumber: user.roomNumber || '', phone: user.phone || '',
    };
    const response = NextResponse.json({ success: true, message: 'Login successful.', data, user: data });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, path: '/',
    });
    return response;
  } catch (error) {
    console.error('Login API error:', error.message);
    const status = /Mongo|server selection|timed out/i.test(error.name + error.message) ? 503 : 500;
    return NextResponse.json({ success: false, message: status === 503 ? 'Database is temporarily unavailable. Please try again.' : 'Unable to sign in right now.' }, { status });
  }
}
