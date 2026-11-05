import { NextResponse } from 'next/server';

export function apiError(error, fallback = 'The request could not be completed.') {
  if (error?.name === 'SyntaxError') {
    return NextResponse.json({ success: false, message: 'Request body must be valid JSON.' }, { status: 400 });
  }
  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];
    const label = field === 'registrationNumber' ? 'registration number' : field === 'email' ? 'email' : field || 'value';
    return NextResponse.json({ success: false, message: `A record with this ${label} already exists.` }, { status: 409 });
  }
  if (error?.name === 'ValidationError') {
    return NextResponse.json({ success: false, message: Object.values(error.errors || {}).map((item) => item.message).join(' ') || 'Please check the submitted information.' }, { status: 400 });
  }
  if (error?.name === 'CastError') {
    return NextResponse.json({ success: false, message: 'The requested record was not found.' }, { status: 404 });
  }
  if (/Mongo|server selection|timed out|ECONNREFUSED|ENOTFOUND/i.test(`${error?.name || ''} ${error?.message || ''}`)) {
    return NextResponse.json({ success: false, message: 'Database is temporarily unavailable. Please try again.' }, { status: 503 });
  }
  return NextResponse.json({ success: false, message: fallback }, { status: 500 });
}
