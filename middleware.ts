import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { requireJwtSecret } from '@/lib/jwt-secret';

function isProtectedPath(pathname: string) {
  return (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/studio') ||
    pathname.startsWith('/editor') ||
    pathname.startsWith('/builder') ||
    pathname.startsWith('/tutor-view')
  );
}

function isAuthoringPath(pathname: string) {
  return (
    pathname.startsWith('/studio') ||
    pathname.startsWith('/editor') ||
    pathname.startsWith('/builder') ||
    pathname.startsWith('/tutor-view') ||
    pathname.startsWith('/dashboard/tutor')
  );
}

function isStudentDashboardPath(pathname: string) {
  return pathname.startsWith('/dashboard/student');
}

function isAuthoringRole(role: unknown) {
  return role === 'tutor' || role === 'teacher' || role === 'admin';
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const { pathname } = url;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  let secret: string;
  try {
    secret = requireJwtSecret();
  } catch {
    console.error('[Middleware] JWT_SECRET is not set. Refusing to authenticate.');
    return new NextResponse('Server misconfigured', { status: 500 });
  }

  const token = request.cookies.get('ast_token')?.value;
  if (!token) {
    console.log('[Middleware] No token found. Redirecting to home.');
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ['HS256'] });
    const role = payload.role;

    if (isAuthoringPath(pathname) && !isAuthoringRole(role)) {
      return NextResponse.redirect(new URL('/dashboard/student', request.url));
    }

    if (isStudentDashboardPath(pathname) && isAuthoringRole(role)) {
      return NextResponse.redirect(new URL('/dashboard/tutor', request.url));
    }

    if (pathname.startsWith('/onboarding') && isAuthoringRole(role)) {
      return NextResponse.redirect(new URL('/dashboard/tutor', request.url));
    }

    return NextResponse.next();
  } catch (err: any) {
    console.error('[Middleware] Token invalid:', err.message);
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding',
    '/onboarding/:path*',
    '/studio/:path*',
    '/studio',
    '/editor/:path*',
    '/editor',
    '/builder/:path*',
    '/builder',
    '/tutor-view/:path*',
  ],
};
