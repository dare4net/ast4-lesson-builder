import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { requireJwtSecret } from '@/lib/jwt-secret';
import { homePathForRole } from '@/lib/home-path';
import { parseVanitySlug, VANITY_ORG_SLUG_COOKIE } from '@/lib/vanity-host';

function applyVanityOrgCookie(request: NextRequest, response: NextResponse) {
  const slug = parseVanitySlug(request.headers.get('host') || request.nextUrl.hostname);
  if (slug) {
    response.cookies.set(VANITY_ORG_SLUG_COOKIE, slug, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });
    return;
  }
  if (request.cookies.get(VANITY_ORG_SLUG_COOKIE)) {
    response.cookies.delete(VANITY_ORG_SLUG_COOKIE);
  }
}

function withVanityCookie(request: NextRequest, response: NextResponse) {
  applyVanityOrgCookie(request, response);
  return response;
}

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

function isOrgDashboardPath(pathname: string) {
  return pathname.startsWith('/dashboard/org');
}

function isAuthoringRole(role: unknown) {
  return role === 'tutor' || role === 'teacher' || role === 'admin';
}

function canUseAuthoringTools(role: unknown) {
  return isAuthoringRole(role) || isOrgRole(role);
}

function isOrgRole(role: unknown) {
  return role === 'organization' || role === 'org';
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const { pathname } = url;

  if (!isProtectedPath(pathname)) {
    return withVanityCookie(request, NextResponse.next());
  }

  let secret: string;
  try {
    secret = requireJwtSecret();
  } catch {
    console.error('[Middleware] JWT_SECRET is not set. Refusing to authenticate.');
    return withVanityCookie(request, new NextResponse('Server misconfigured', { status: 500 }));
  }

  const token = request.cookies.get('ast_token')?.value;
  if (!token) {
    // Club dashboard shows its own login — invite-only orgs bookmark this URL.
    if (pathname.startsWith('/dashboard/org')) {
      return withVanityCookie(request, NextResponse.next());
    }
    console.log('[Middleware] No token found. Redirecting to home.');
    return withVanityCookie(request, NextResponse.redirect(new URL('/', request.url)));
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ['HS256'] });
    const role = payload.role;
    const home = homePathForRole(typeof role === 'string' ? role : null);

    // Org owners use the club dashboard — not the tutor dashboard — but may use Creator Studio.
    if (pathname.startsWith('/dashboard/tutor') && isOrgRole(role)) {
      return withVanityCookie(request, NextResponse.redirect(new URL('/dashboard/org', request.url)));
    }

    // Studio / editor: students stay out; org owners may author for their club.
    if (isAuthoringPath(pathname) && !canUseAuthoringTools(role)) {
      return withVanityCookie(request, NextResponse.redirect(new URL(home, request.url)));
    }

    if (isStudentDashboardPath(pathname) && (isAuthoringRole(role) || isOrgRole(role))) {
      return withVanityCookie(request, NextResponse.redirect(new URL(home, request.url)));
    }

    // Club dashboard is separate from tutor — tutors may open it if they also staff an org.
    if (isOrgDashboardPath(pathname) && !isOrgRole(role) && !isAuthoringRole(role)) {
      return withVanityCookie(request, NextResponse.redirect(new URL('/dashboard/student', request.url)));
    }

    if (pathname.startsWith('/onboarding') && (isAuthoringRole(role) || isOrgRole(role))) {
      return withVanityCookie(request, NextResponse.redirect(new URL(home, request.url)));
    }

    return withVanityCookie(request, NextResponse.next());
  } catch (err: any) {
    console.error('[Middleware] Token invalid:', err.message);
    if (isOrgDashboardPath(pathname)) {
      return withVanityCookie(request, NextResponse.next());
    }
    return withVanityCookie(request, NextResponse.redirect(new URL('/', request.url)));
  }
}

export const config = {
  matcher: [
    '/join/:path*',
    '/join',
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
