import { pagesOptions } from '@/app/api/auth/[...nextauth]/pages-options';
import withAuth from 'next-auth/middleware';
import { NextResponse, type NextRequest } from 'next/server';

const authMiddleware = withAuth(
  function authMiddleware(req: NextRequest) {
    const response = NextResponse.next();
    const token = req.cookies.get('next-auth.session-token') ||
      req.cookies.get('__Secure-next-auth.session-token');
    if (token) {
      response.headers.set('X-NextAuth-Token', token.value);
    }
    return response;
  },
  { pages: { ...pagesOptions } }
);

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === '/landing' || req.nextUrl.pathname === '/') {
    return NextResponse.next();
  }
  return (authMiddleware as (req: NextRequest) => Response | Promise<Response>)(req);
}

export const config = {
  // restricted routes (главная страница '/' исключена, чтобы показывать wizard без авторизации)
  matcher: [
    '/executive',
    '/financial',
    '/analytics',
    '/logistics/:path*',
    '/ecommerce/:path*',
    '/support/:path*',
    '/file/:path*',
    '/file-manager',
    '/invoice/:path*',
    '/forms/profile-settings/:path*',
    '/dashboard/:path*',
    '/frappe-builder',
  ],
};
