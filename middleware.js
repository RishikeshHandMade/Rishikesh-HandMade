import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  const { pathname } = req.nextUrl;

  // Allow access to public routes (e.g., /sign-in, /admin/login)
  if (pathname.startsWith("/admin/login")) {
    if (token) {
      if (token.isAdmin || token.isSubAdmin) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
    if (token && !token.isAdmin && !token.isSubAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Protect /admin/* pages (Allow both Admins & SubAdmins)
  if (pathname.startsWith("/admin")) {
    if (!token || (!token.isAdmin && !token.isSubAdmin)) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // Protect /api/admin/* routes (Allow both Admins & SubAdmins)
  if (pathname.startsWith("/api/admin")) {
    if (!token || (!token.isAdmin && !token.isSubAdmin)) {
      return NextResponse.json(
        { message: "Unauthorized access!" },
        { status: 403 }
      );
    }
  }

  // Protect /profile page: Only allow logged-in users (Google Auth or credentials)
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/orders")) {
    if (!token) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }
  if (pathname.startsWith('/vendor')) {
    const session = await getToken({ req: request });

    if (!session || session.role !== 'vendor') {
      const url = new URL('/vendor/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

return NextResponse.next();
}

// Apply middleware to protect admin and user routes
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/checkout/orderConfirmed/:path*",
    "/sign-in",
    "/sign-up",
    "/admin/login",
  ],
};
