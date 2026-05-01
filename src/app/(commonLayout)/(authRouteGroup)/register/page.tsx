import RegisterForm from "@/components/modules/Auth/RegisterForm";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4 py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-pink-500/10 dark:bg-pink-500/5 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      
      <Card className="relative z-10 w-full max-w-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/20 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden my-8">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>
        <CardHeader className="space-y-2 pb-6 text-center pt-8">
          <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent pb-1" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Create an Account
          </CardTitle>
          <CardDescription className="text-sm font-medium text-slate-500 dark:text-slate-400" style={{ fontFamily: "var(--font-sora)" }}>
            Join us and start exploring amazing features
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <RegisterForm />
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium" style={{ fontFamily: "var(--font-sora)" }}>
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
