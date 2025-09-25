// api/auth/login/route

import { NextResponse } from 'next/server';
import { authenticateUser, generateToken } from '../../../../lib/auth';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const user = await authenticateUser(email, password);
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = generateToken(user);

  // Set HttpOnly cookie
  const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return response;
}
