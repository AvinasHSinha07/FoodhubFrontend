import LoginForm from "@/components/modules/Auth/LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4 py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <Card className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl rounded-3xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <CardHeader className="space-y-2 pb-6 text-center">
          <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent pb-1" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Welcome Back
          </CardTitle>
          <CardDescription className="text-sm font-medium text-slate-500" style={{ fontFamily: "var(--font-sora)" }}>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <Suspense fallback={<div className="flex justify-center p-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>}>
            <LoginForm />
          </Suspense>
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 font-medium" style={{ fontFamily: "var(--font-sora)" }}>
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-indigo-600 hover:text-purple-600 transition-colors duration-200"
              >
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
