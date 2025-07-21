import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;

  if (url.pathname.startsWith('/viewer')) {
    const token = url.searchParams.get('token');
    if (!token) {
      return new NextResponse('Access Denied: Missing token', { status: 403 });
    }

    try {
      const secret = new TextEncoder().encode(process.env.LESSON_SECRET!);
      const { payload } = await jwtVerify(token, secret, {
        algorithms: ['HS256'],
      });

      console.log('[Middleware] Token valid:', payload);
      // You can also check payload.userId or payload.lessonId here if needed
      return NextResponse.next();
    } catch (err: any) {
      console.error('[Middleware] Invalid token:', err.message);
      return new NextResponse('Access Denied: Invalid token', { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/viewer/:path*'],
};
