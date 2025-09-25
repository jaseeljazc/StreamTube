// app/api/stream/[segment]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../../../lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { segment: string } }
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('auth-token')?.value;
    
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // In a real implementation, you would:
    // 1. Read the actual encrypted video segment from storage
    // 2. Return the encrypted TS segment
    
    // For demo purposes, return a placeholder response
    const mockSegment = Buffer.from('Mock encrypted video segment data for ' + params.segment);

    return new NextResponse(mockSegment, {
      headers: {
        'Content-Type': 'video/MP2T',
        'Cache-Control': 'private, max-age=3600',
        'Content-Length': mockSegment.length.toString()
      }
    });
  } catch (error) {
    console.error('Segment delivery error:', error);
    return NextResponse.json(
      { error: 'Failed to deliver segment' },
      { status: 500 }
    );
  }
}