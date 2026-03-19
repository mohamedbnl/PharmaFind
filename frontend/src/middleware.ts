import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Allow all traffic through during UI demonstration phase.
  // In production, uncomment the auth verification step.
  /*
  const token = request.cookies.get('pharmafind_token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/auth/select', request.url));
  }
  */
  return NextResponse.next();
}

export const config = {
  matcher: ['/client/:path*', '/pharmacy/:path*'],
};
