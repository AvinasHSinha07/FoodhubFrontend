import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
    getDefaultDashboardRoute,
    getRouteOwner,
    isAuthRoute,
    UserRole,
} from "./lib/authUtils";

// ✅ FIX 1: Remove NEXT_PUBLIC_API_BASE_URL — it was never set on Vercel
// Use NEXT_PUBLIC_API_URL only. NEXT_PUBLIC_ vars work in middleware (edge runtime).
const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api/v1";

const isProduction = process.env.NODE_ENV === "production";

const normalizeRole = (role?: string): UserRole | undefined => {
    if (!role) return undefined;
    if (role === "SUPER_ADMIN") return "ADMIN";
    if (role === "ADMIN" || role === "PROVIDER" || role === "CUSTOMER") return role;
    return undefined;
};

// ✅ FIX 2: userRole cookie must also be sameSite=none + secure in production
// Otherwise the browser rejects it just like the session cookie
const setRoleCookie = (response: NextResponse, role: UserRole) => {
    response.cookies.set("userRole", role, {
        path: "/",
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
        httpOnly: false,       // needs to be readable by JS if you use it client-side
        maxAge: 60 * 60 * 24,
    });
};

// ✅ FIX 3: Forward all cookies correctly to backend for role resolution
const resolveRoleFromBackend = async (
    request: NextRequest
): Promise<UserRole | undefined> => {
    try {
        const cookieHeader = request.headers.get("cookie") || "";

        if (!cookieHeader) return undefined;

        const result = await fetch(`${API_BASE_URL}/users/me`, {
            method: "GET",
            headers: {
                "cookie": cookieHeader,
                "Content-Type": "application/json",
                // ✅ FIX 4: Forward origin so backend CORS + trustedOrigins accepts it
                "Origin": "https://foodhub-frontend-vyqi.vercel.app",
            },
            cache: "no-store",
        });

        if (!result.ok) {
            return undefined;
        }

        const payload = await result.json();
        return normalizeRole(payload?.data?.role);

    } catch (error) {
        console.error("[middleware] resolveRoleFromBackend failed:", error);
        return undefined;
    }
};

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const pathWithQuery = `${pathname}${request.nextUrl.search}`;

    // ✅ FIX 5: In production, better-auth adds __Secure- prefix to cookie names
    // Check __Secure- first (production), then plain name (local dev)
    const sessionToken =
        request.cookies.get("__Secure-better-auth.session_token")?.value ||
        request.cookies.get("better-auth.session_token")?.value;

    const cookieRole = normalizeRole(request.cookies.get("userRole")?.value);
    const routeOwner = getRouteOwner(pathname);

    // Logged-in users should not hit auth routes
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

    // Public route — allow through
    if (routeOwner === null) {
        return NextResponse.next();
    }

    // Protected route without session — redirect to login
    if (!sessionToken) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathWithQuery);
        return NextResponse.redirect(loginUrl);
    }

    // Resolve role: use cookie cache first, fallback to backend
    let effectiveRole = cookieRole;
    if (!effectiveRole || routeOwner !== effectiveRole) {
        effectiveRole = await resolveRoleFromBackend(request);
    }

    // Session exists but role cannot be resolved — force login
    if (!effectiveRole) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathWithQuery);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete("userRole");
        return response;
    }

    // Wrong role for this route — redirect to correct dashboard
    if (routeOwner !== effectiveRole) {
        return NextResponse.redirect(
            new URL(getDefaultDashboardRoute(effectiveRole), request.url)
        );
    }

    // All checks passed — allow through and refresh role cookie
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