"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { authClient } from "@/lib/authClient";
import {
  getDefaultDashboardRoute,
  UserRole,
} from "@/lib/authUtils";

/**
 * Better Auth redirects the browser to this page after a successful Google OAuth flow.
 *
 * What happens here:
 *  1. Call authClient.getSession() — the session cookie is already set by the backend.
 *  2. Extract the user role from the session (same field as email login).
 *  3. Write the userRole cookie so the middleware can use it on subsequent requests.
 *  4. Navigate to the appropriate dashboard.
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const resolveAndRedirect = async () => {
      try {
        const { data, error } = await authClient.getSession();

        if (cancelled) return;

        if (error || !data?.user) {
          // Session not found — send back to login
          router.replace("/login?error=oauth_failed");
          return;
        }

        const role = (data.user as any).role as UserRole | undefined;

        if (role) {
          // Mirror exactly what AuthServices.loginUser does
          setCookie("userRole", role, {
            path: "/",
            sameSite: "lax",
            maxAge: 60 * 60 * 24,
          });
          router.replace(getDefaultDashboardRoute(role));
        } else {
          // Role missing — default to home
          router.replace("/");
        }
      } catch {
        if (!cancelled) {
          router.replace("/login?error=oauth_failed");
        }
      }
    };

    resolveAndRedirect();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="flex flex-col items-center gap-5 text-center px-4">
        {/* Double-ring spinner */}
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-slate-800" />
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 dark:border-t-indigo-400 animate-spin" />
        </div>

        {/* Google G mark */}
        <svg
          className="h-7 w-7 opacity-60"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>

        <div>
          <p
            className="text-lg font-semibold text-slate-700 dark:text-slate-200"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Completing sign-in&hellip;
          </p>
          <p
            className="mt-1 text-sm text-slate-500 dark:text-slate-400"
            style={{ fontFamily: "var(--font-sora)" }}
          >
            Setting up your session, hang tight.
          </p>
        </div>
      </div>
    </div>
  );
}
