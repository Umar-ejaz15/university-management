import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Admin-only routes (require ADMIN role)
const adminRoutes = ['/admin'];

// Protected routes that require authentication and approval
const protectedRoutes = [
  '/faculty/edit', // Edit profile requires authentication
];

// Auth routes that should redirect to dashboard if already logged in
const authRoutes = ['/login', '/signup'];

// Public routes that don't require authentication
const publicRoutes = [
  '/uni-dashboard', // Allow everyone to view the main dashboard
  '/faculties', // Allow everyone to browse faculties
  '/faculty', // Allow everyone to view faculty profiles
  '/staff', // Allow everyone to view staff listing
  '/onboarding/teacher',
  '/pending-approval',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  // =================================================================
  // 1. ADMIN ROUTE PROTECTION
  // =================================================================
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const user = await verifyToken(token);

      if (!user || user.role !== 'ADMIN') {
        const dashboardUrl = new URL('/uni-dashboard', request.url);
        dashboardUrl.searchParams.set('error', 'forbidden');
        return NextResponse.redirect(dashboardUrl);
      }
    } catch (error) {
      // Invalid token
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // =================================================================
  // 2. HANDLE /faculty ROUTE (redirect to own profile)
  // =================================================================
  if (pathname === '/faculty') {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Let the page handle the redirect to own profile
    return NextResponse.next();
  }

  // =================================================================
  // 3. PROTECTED ROUTES - REQUIRE AUTHENTICATION
  // =================================================================
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // =================================================================
  // 4. VERIFY TOKEN FOR PROTECTED ROUTES
  // =================================================================
  // Note: Faculty status checks (PENDING/REJECTED) are now handled in the
  // individual pages/components since middleware runs in Edge Runtime and
  // cannot access the database via Prisma.
  if (isProtectedRoute && token) {
    try {
      const user = await verifyToken(token);

      if (!user) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('error', 'session_invalid');

        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete('auth-token');
        return response;
      }
    } catch (error) {
      // Invalid token - redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'session_invalid');

      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('auth-token');
      return response;
    }
  }

  // =================================================================
  // 5. AUTH ROUTES - REDIRECT IF ALREADY LOGGED IN
  // =================================================================
  if (authRoutes.some(route => pathname.startsWith(route)) && token) {
    const isValidFormat = token.split('.').length === 3;
    if (isValidFormat) {
      try {
        const user = await verifyToken(token);

        if (user) {
          // Admins go to admin panel, faculty to dashboard
          const redirectUrl = user.role === 'ADMIN'
            ? new URL('/admin', request.url)
            : new URL('/uni-dashboard', request.url);

          return NextResponse.redirect(redirectUrl);
        }
      } catch (error) {
        // Invalid token, allow access to auth routes
      }
    }
  }

  // =================================================================
  // 6. PENDING APPROVAL PAGE ACCESS
  // =================================================================
  if (pathname.startsWith('/pending-approval')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const user = await verifyToken(token);

      // Only FACULTY can access pending approval page
      if (user && user.role !== 'FACULTY') {
        return NextResponse.redirect(new URL('/uni-dashboard', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};