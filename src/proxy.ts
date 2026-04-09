import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UserRole } from "./types/user.types";

const roleBasedRoutes: Record<string, UserRole[]> = {
  "/admin": [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  "/provider": [UserRole.PROVIDER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
  "/customer": [UserRole.CUSTOMER],
  "/checkout": [UserRole.CUSTOMER],
};

const authRoutes = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const sessionToken = request.cookies.get("better-auth.session_token")?.value;
  const userRole = request.cookies.get("userRole")?.value as UserRole | undefined;

  // Redirect unauthenticated trying to access protected paths
  for (const route in roleBasedRoutes) {
    if (pathname.startsWith(route)) {
      if (!sessionToken) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      if (userRole && !roleBasedRoutes[route].includes(userRole)) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  // Redirect auth paths if already logged in
  if (authRoutes.includes(pathname) && sessionToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/provider/:path*",
    "/customer/:path*",
    "/checkout/:path*",
    "/login",
    "/register"
  ],
};
