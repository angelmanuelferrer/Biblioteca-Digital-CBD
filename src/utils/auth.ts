import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'supersecret';
const JWT_EXPIRES_IN = '7d';

export function generateToken(userId: string, role: string): string {
  return jwt.sign({ userId, userRole: role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): { userId: string; userRole: string } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; userRole: string };
    return { userId: payload.userId, userRole: payload.userRole };
  } catch {
    return null;
  }
}
