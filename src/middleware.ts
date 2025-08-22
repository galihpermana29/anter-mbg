import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "./shared/session/getter-session";

// Define public routes that don't require authentication
const publicRoutes = ["/login", "/"];

// Define routes that require authentication based on role
const protectedRoutes = {
  KITCHEN: ["/admin"],
  SCHOOL: ["/school"],
  DRIVER: ["/driver"],
};

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const session = await getSession();
  const { pathname } = request.nextUrl;

  // Check if the user is authenticated (has a valid access token)
  const isAuthenticated = !!session.access_token;

  // If the route is public and user is authenticated, redirect based on role
  if (publicRoutes.some((route) => pathname === route) && isAuthenticated) {
    // Role-based redirection
    if (session.role === "KITCHEN") {
      return NextResponse.redirect(new URL("/admin/pesanan", request.url));
    } else if (session.role === "SCHOOL") {
      return NextResponse.redirect(new URL("/school", request.url));
    } else if (session.role === "DRIVER") {
      return NextResponse.redirect(new URL("/driver", request.url));
    }

    // Default redirect if role is not recognized
    return NextResponse.redirect(new URL("/admin/pesanan", request.url));
  }

  // If the route is protected and user is not authenticated, redirect to login
  if (!isAuthenticated) {
    // Check if trying to access KITCHEN routes
    if (protectedRoutes.KITCHEN.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check if trying to access SCHOOL routes
    if (protectedRoutes.SCHOOL.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Role-based access control - prevent wrong role from accessing unauthorized areas
  if (isAuthenticated) {
    // If KITCHEN role trying to access SCHOOL routes
    if (
      session.role === "KITCHEN" &&
      protectedRoutes.SCHOOL.some((route) => pathname.startsWith(route))
    ) {
      return NextResponse.redirect(new URL("/admin/pesanan", request.url));
    }

    // If SCHOOL role trying to access KITCHEN routes
    if (
      session.role === "SCHOOL" &&
      protectedRoutes.KITCHEN.some((route) => pathname.startsWith(route))
    ) {
      return NextResponse.redirect(new URL("/school", request.url));
    }
  }

  return res;
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
