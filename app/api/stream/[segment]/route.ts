// app/api/stream/[segment]/route.ts

import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/auth';

export async function GET(request: NextRequest, { params }: { params: { segment: string } }) {
  try {
    // Get token from both header and cookie (consistent with playlist route)
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('auth-token')?.value;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;
    const videoId = request.nextUrl.searchParams.get('videoId');

    console.log('Segment request:', params.segment, 'videoId:', videoId);

    if (!token) {
      console.log('No token provided for segment');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      console.log('Invalid token for segment');
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    // Support multiple segment path patterns
    let filePath: string;
    
    if (videoId) {
      // If videoId is provided, look in video-specific directory
      filePath = path.join(process.cwd(), 'public', 'videos', `video-${videoId}`, params.segment);
    } else {
      // Fallback to segments directory
      filePath = path.join(process.cwd(), 'segments', params.segment);
    }

    console.log('Looking for segment at:', filePath);

    if (!fs.existsSync(filePath)) {
      console.log('Segment not found:', filePath);
      return NextResponse.json({ error: 'Segment not found' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    
    return new NextResponse(fileBuffer, {
      headers: { 
        'Content-Type': 'video/MP2T',
        'Cache-Control': 'private, max-age=3600',
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Access-Control-Allow-Credentials': 'true',
      }
    });

  } catch (error) {
    console.error('Error serving segment:', error);
    return NextResponse.json({ error: 'Failed to serve segment' }, { status: 500 });
  }
}