import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const refreshToken: string | undefined =
    request.cookies.get('refreshToken')?.value;
  const { pathname } = request.nextUrl;

  const publicPaths: string[] = ['/', '/registration'];

  const isPublic: boolean = publicPaths.some((path: string): boolean => {
    if (path === '/') return pathname === '/';
    return pathname === path;
  });

  if (!refreshToken && !isPublic) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (refreshToken && pathname === '/') {
    return NextResponse.redirect(new URL('/feed', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|images).*)'],
};
