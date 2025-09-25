// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Protect streaming routes
  if (request.nextUrl.pathname.startsWith('/api/stream') || 
      request.nextUrl.pathname.startsWith('/api/key')) {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/stream/:path*', '/api/key/:path*', '/dashboard/:path*']
};