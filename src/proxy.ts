import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getDefaultDashboardRoute,
  getRouteOwner,
  isAuthRoute,
  UserRole,
} from "./lib/authUtils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const normalizeRole = (role?: string): UserRole | undefined => {
  if (!role) {
    return undefined;
  }

  if (role === "SUPER_ADMIN") {
    return "ADMIN";
  }

  if (role === "ADMIN" || role === "PROVIDER" || role === "CUSTOMER") {
    return role;
  }

  return undefined;
};

const setRoleCookie = (response: NextResponse, role: UserRole) => {
  response.cookies.set("userRole", role, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
  });
};

const resolveRoleFromBackend = async (
  request: NextRequest
): Promise<UserRole | undefined> => {
  try {
    const cookieHeader = request.headers.get("cookie") || "";

    const result = await fetch(`${API_BASE_URL}/users/me`, {
      method: "GET",
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!result.ok) {
      return undefined;
    }

    const payload = await result.json();
    return normalizeRole(payload?.data?.role);
  } catch (error) {
    return undefined;
  }
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathWithQuery = `${pathname}${request.nextUrl.search}`;

  const sessionToken = request.cookies.get("better-auth.session_token")?.value;
  const cookieRole = normalizeRole(request.cookies.get("userRole")?.value);

  const routeOwner = getRouteOwner(pathname);

  // Logged in users should not hit auth routes.
  if (isAuthRoute(pathname) && sessionToken) {
    const resolvedRole = cookieRole || (await resolveRoleFromBackend(request));

    if (resolvedRole) {
      const response = NextResponse.redirect(
        new URL(getDefaultDashboardRoute(resolvedRole), request.url)
      );

      if (cookieRole !== resolvedRole) {
        setRoleCookie(response, resolvedRole);
      }

      return response;
    }

    const response = NextResponse.next();
    response.cookies.delete("userRole");
    return response;
  }

  // Public route, allow.
  if (routeOwner === null) {
    return NextResponse.next();
  }

  // Protected route without session, redirect to login with callback path.
  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathWithQuery);
    return NextResponse.redirect(loginUrl);
  }

  // Resolve role from cookie, then fallback to backend if needed.
  let effectiveRole = cookieRole;

  if (!effectiveRole || routeOwner !== effectiveRole) {
    effectiveRole = await resolveRoleFromBackend(request);
  }

  // Session exists but cannot resolve role => force login.
  if (!effectiveRole) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathWithQuery);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("userRole");
    return response;
  }

  // Enforce role ownership for protected route groups.
  if (routeOwner !== effectiveRole) {
    return NextResponse.redirect(
      new URL(getDefaultDashboardRoute(effectiveRole), request.url)
    );
  }

  const response = NextResponse.next();

  if (cookieRole !== effectiveRole) {
    setRoleCookie(response, effectiveRole);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
