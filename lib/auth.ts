// lib/auth.ts - Your authentication utilities
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface User {
  id: string;
  email: string;
  name: string;
}

export function generateToken(user: User): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): User | null {
  try {
    return jwt.verify(token, JWT_SECRET) as User;
  } catch {
    return null;
  }
}

export function generateKeyUrl(userId: string): string {
  // Return just the path, not the full URL
  return `/api/key/enc.keys?userId=${userId}`;
}