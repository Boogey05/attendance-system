import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if the path starts with /admin
  if (pathname.startsWith('/admin')) {
    // Allow access to login page
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Check for admin cookie
    const cookieStore = cookies();
    const adminId = cookieStore.get('adminId');

    // If no admin cookie is present, redirect to login
    if (!adminId) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
}; 