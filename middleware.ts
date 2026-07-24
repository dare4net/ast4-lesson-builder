import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const token = request.cookies.get('ast_token')?.value;

  // Protect /dashboard routes
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

  // Handle /viewer routes (stays same as requested previously or as currently exists)
  if (url.pathname.startsWith('/viewer')) {
    const viewerToken = url.searchParams.get('token');
    if (!viewerToken) {
      return new NextResponse('Access Denied: Missing token', { status: 403 });
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dami');
      await jwtVerify(viewerToken, secret, { algorithms: ['HS256'] });
      return NextResponse.next();
    } catch (err: any) {
      return new NextResponse('Access Denied: Invalid token', { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/viewer/:path*'],
};
