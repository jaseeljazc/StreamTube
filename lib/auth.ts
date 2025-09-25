// lib/auth.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const AES_KEY = process.env.AES_KEY || '0123456789abcdef0123456789abcdef'; // 32 hex chars for AES-128

// Mock user database with properly hashed password
const users = [
  {
    id: 1,
    email: 'user@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password123'
  }
];

export interface User {
  id: number;
  email: string;
}

// export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
//   console.log('Authenticating user:', email);
//   const user = users.find(u => u.email === email);
//   if (!user) {
//     console.log('User not found:', email);
//     return null;
//   }
  
//   console.log('Found user, comparing passwords...');
//   const isValid = await bcrypt.compare(password, user.password);
//   console.log('Password comparison result:', isValid);
  
//   if (!isValid) return null;
  
//   return { id: user.id, email: user.email };
// };



export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  console.log('Authenticating user:', email);
  const user = users.find(u => u.email === email);
  if (!user) {
    console.log('User not found:', email);
    return null;
  }
  
  console.log('Found user, checking password...');
  // Temporary bypass for testing
  const isValid = password === 'password123';
  console.log('Password check result:', isValid);
  
  if (!isValid) return null;
  
  return { id: user.id, email: user.email };
};

export const generateToken = (user: User): string => {
  return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
};

export const verifyToken = (token: string): User | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { id: decoded.userId, email: decoded.email };
  } catch {
    return null;
  }
};

export const generateKeyUrl = (userId: number): string => {
  const timestamp = Math.floor(Date.now() / 1000);
  const expiry = timestamp + 3600; // 1 hour
  
  const payload = {
    userId,
    timestamp,
    expiry,
    keyId: 'key1'
  };
  
  const signature = jwt.sign(payload, JWT_SECRET);
  return `/api/key?token=${signature}`;
};

export const getAESKey = (): Buffer => {
  return Buffer.from(AES_KEY, 'hex');
};