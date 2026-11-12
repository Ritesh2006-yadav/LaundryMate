import { NextResponse } from 'next/server';

function notFound() {
  return NextResponse.json({ success: false, message: 'API route not found.' }, { status: 404 });
}

export const GET = notFound;
export const POST = notFound;
export const PUT = notFound;
export const PATCH = notFound;
export const DELETE = notFound;
export const OPTIONS = notFound;
export const HEAD = notFound;
