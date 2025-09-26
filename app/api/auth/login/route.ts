// app/api/auth/login/route.ts - Login API
import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Replace this with your actual user verification logic
    if (email === 'user@example.com' && password === 'password123') {
      const user = {
        id: '1',
        email: 'user@example.com',
        name: 'Test User'
      };

      const token = generateToken(user);

      const response = NextResponse.json({ 
        success: true, 
        user,
        token 
      });

      // Set cookie
      response.cookies.set('auth-token', token, {
        httpOnly: false, // Set to true for production
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}

// ============================================
