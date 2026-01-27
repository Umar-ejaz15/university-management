import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Protected routes that require authentication
const protectedRoutes = [
  '/uni-dashboard',
  '/faculties',
  '/add-faculty',
  '/admin-review',
  '/faculty',
];

// Auth routes that should redirect to dashboard if already logged in
const authRoutes = ['/login', '/signup'];

// Public routes that don't require authentication
const publicRoutes = ['/onboarding/teacher'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Check if current route is public (accessible without auth)
  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route)
  );

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing auth route with valid token, redirect to dashboard
  if (authRoutes.some(route => pathname.startsWith(route)) && token) {
    // Basic token structure check (full validation happens in components)
    const isValidFormat = token.split('.').length === 3;
    if (isValidFormat) {
      return NextResponse.redirect(new URL('/uni-dashboard', request.url));
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