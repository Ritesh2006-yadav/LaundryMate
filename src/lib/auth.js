import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'laundrymate_token';

function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set to a random value of at least 32 characters.');
  }
  return secret;
}

export function signToken(user) {
  return jwt.sign({
    id: user._id ? user._id.toString() : user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    registrationNumber: user.registrationNumber || '',
    hostel: user.hostel || '',
    block: user.block || '',
    roomNumber: user.roomNumber || '',
  }, jwtSecret(), { expiresIn: '7d', issuer: 'laundrymate', audience: 'laundrymate-web' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, jwtSecret(), { issuer: 'laundrymate', audience: 'laundrymate-web' });
  } catch {
    return null;
  }
}

export async function getSessionUser(req) {
  let token;
  try { token = cookies().get(COOKIE_NAME)?.value; } catch { /* outside a request context */ }
  if (!token && req?.headers) {
    const header = typeof req.headers.get === 'function' ? req.headers.get('authorization') : req.headers.authorization;
    if (header?.startsWith('Bearer ')) token = header.slice(7);
  }
  return token ? verifyToken(token) : null;
}

export async function requireAuth(req, allowedRoles = []) {
  const user = await getSessionUser(req);
  if (!user) return {
    authenticated: false, user: null,
    errorResponse: Response.json({ success: false, message: 'Authentication required. Please log in.' }, { status: 401 }),
  };
  if (allowedRoles.length && !allowedRoles.includes(user.role)) return {
    authenticated: false, user,
    errorResponse: Response.json({ success: false, message: 'You do not have permission to access this resource.' }, { status: 403 }),
  };
  return { authenticated: true, user, errorResponse: null };
}

export { COOKIE_NAME };
