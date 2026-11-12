import { NextResponse } from 'next/server';

const COOKIE_NAME = 'laundrymate_token';
const encoder = new TextEncoder();

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

async function verifySession(token) {
  try {
    const [headerPart, payloadPart, signaturePart] = token.split('.');
    if (!headerPart || !payloadPart || !signaturePart) return null;
    const header = JSON.parse(new TextDecoder().decode(decodeBase64Url(headerPart)));
    if (header.alg !== 'HS256') return null;

    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) return null;
    const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const valid = await crypto.subtle.verify('HMAC', key, decodeBase64Url(signaturePart), encoder.encode(`${headerPart}.${payloadPart}`));
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(payloadPart)));
    if (!payload.id || !payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    if (payload.iss !== 'laundrymate' || payload.aud !== 'laundrymate-web') return null;
    if (!['student', 'staff', 'admin'].includes(payload.role)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await verifySession(token) : null;
  const staffRole = user?.role === 'staff' || user?.role === 'admin';

  if (pathname.startsWith('/student')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url));
    if (staffRole) return NextResponse.redirect(new URL('/staff/dashboard', request.url));
  }
  if (pathname.startsWith('/staff')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url));
    if (!staffRole) return NextResponse.redirect(new URL('/student/dashboard', request.url));
  }
  if (pathname === '/login' && user) {
    return NextResponse.redirect(new URL(staffRole ? '/staff/dashboard' : '/student/dashboard', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/student/:path*', '/staff/:path*', '/login'] };
