
// app/api/keys/enc.key/route.ts - Key serving endpoint
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/auth';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('auth-token')?.value;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const keyPath = path.join(process.cwd(), 'enc.key');
    const keyBuffer = fs.readFileSync(keyPath);

    return new NextResponse(keyBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Cache-Control': 'private, max-age=3600',
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Key not found' }, { status: 404 });
  }
}

// ============================================