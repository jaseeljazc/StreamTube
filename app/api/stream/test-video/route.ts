// app/api/stream/playlist.m3u8/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, generateKeyUrl } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
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

    // Generate signed key URL for this user
    const keyUrl = generateKeyUrl(user.id);

    // Create HLS playlist with encryption
    const playlist = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-KEY:METHOD=AES-128,URI="${keyUrl}",IV=0x00000000000000000000000000000001
#EXTINF:10.0,
/api/stream/segment0.ts
#EXTINF:10.0,
/api/stream/segment1.ts
#EXTINF:10.0,
/api/stream/segment2.ts
#EXTINF:5.0,
/api/stream/segment3.ts
#EXT-X-ENDLIST`;

    return new NextResponse(playlist, {
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Playlist generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate playlist' },
      { status: 500 }
    );
  }
}