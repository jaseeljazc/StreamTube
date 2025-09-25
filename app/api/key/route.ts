// app/api/key/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getAESKey } from '../../../lib/auth';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyToken = searchParams.get('token');

    if (!keyToken) {
      return NextResponse.json(
        { error: 'Key token required' },
        { status: 401 }
      );
    }

    // Verify the signed key request
    let keyPayload: any;
    try {
      keyPayload = jwt.verify(keyToken, process.env.JWT_SECRET || 'your-super-secret-key-change-in-production');
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid key token' },
        { status: 401 }
      );
    }

    // Check expiry
    const currentTime = Math.floor(Date.now() / 1000);
    if (keyPayload.expiry < currentTime) {
      return NextResponse.json(
        { error: 'Key token expired' },
        { status: 401 }
      );
    }

    // Additional auth check from cookie/header
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('auth-token')?.value;
    
    const authToken = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = verifyToken(authToken);
    
    if (!user || user.id !== keyPayload.userId) {
      return NextResponse.json(
        { error: 'Invalid authentication for key' },
        { status: 401 }
      );
    }

    // Return the AES key
    const aesKey = getAESKey();

    return new NextResponse(new Uint8Array(aesKey), {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Key delivery error:', error);
    return NextResponse.json(
      { error: 'Failed to deliver key' },
      { status: 500 }
    );
  }
}
