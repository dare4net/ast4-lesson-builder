import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const token = request.cookies.get('ast_token')?.value;

  // Protect /dashboard routes via ast_token cookie
  if (url.pathname.startsWith('/dashboard')) {
    if (!token) {
      console.log('[Middleware] No token found for dashboard access. Redirecting to home.');
      return NextResponse.redirect(new URL('/', request.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dami');
      await jwtVerify(token, secret, { algorithms: ['HS256'] });
      return NextResponse.next();
    } catch (err: any) {
      console.error('[Middleware] Dashboard token invalid:', err.message);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Allow /viewer routes to pass through directly to the client/SW so offline lesson caching works seamlessly!
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
