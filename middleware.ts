// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const referer = request.headers.get('referer') || '';
  const origin = request.headers.get('origin') || '';
  const url = request.nextUrl;

  if (url.pathname.startsWith('/viewer')) {
    // Allow only if the origin/referer is from app.afterschool.tech
    const allowed = referer.includes('app.afterschool.tech') || origin.includes('app.afterschool.tech');

    if (!allowed) {
      return new NextResponse('Access Denied', { status: 403 });
    }
  }

  return NextResponse.next();
}

// Apply to only /viewer routes
export const config = {
  matcher: ['/viewer/:path*'],
};
