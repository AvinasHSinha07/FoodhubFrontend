import RegisterForm from "@/components/modules/Auth/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="w-full max-w-md">
        <RegisterForm />
        <p className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline hover:text-primary"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
