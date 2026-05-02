"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoginFormData, loginSchema } from "@/zod/auth.validation";
import { AuthServices } from "@/services/auth.services";
import {
  getDefaultDashboardRoute,
  isValidRedirectForRole,
  UserRole,
} from "@/lib/authUtils";
import { getCookie } from "cookies-next";
import GoogleLoginButton from "@/components/modules/Auth/GoogleLoginButton";

const getSafeInternalRedirectPath = (value: string | null): string | null => {
  if (!value) {
    return null;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: AuthServices.loginUser,
  });

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    const { error } = await mutateAsync(data);

    if (error) {
      toast.error(error.message || "Invalid credentials!");
      return;
    }

    toast.success("Successfully logged in!");

    const redirectPath = getSafeInternalRedirectPath(searchParams.get("redirect"));
    const userRole = getCookie("userRole") as UserRole | undefined;

    if (redirectPath && isValidRedirectForRole(redirectPath, userRole)) {
      router.push(redirectPath);
    } else if (userRole) {
      router.push(getDefaultDashboardRoute(userRole));
    } else {
      router.push("/");
    }

    router.refresh();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="admin@foodhub.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full mt-4" disabled={isPending}>
          {isPending ? "Signing in..." : "Sign in"}
        </Button>

        {/* Google OAuth */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white/80 dark:bg-slate-900/80 px-2 text-slate-500">
              or
            </span>
          </div>
        </div>

        <GoogleLoginButton />

        <div className="flex flex-col space-y-2 pt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/80 dark:bg-slate-900/80 px-2 text-slate-500">
                Demo Accounts
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs  hover:text-white"
              disabled={isPending}
              onClick={() => {
                const creds = { email: "avi@gmail.com", password: "asdfghjk" };
                form.setValue("email", creds.email);
                form.setValue("password", creds.password);
                onSubmit(creds);
              }}
            >
              Admin
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs hover:text-white"
              disabled={isPending}
              onClick={() => {
                const creds = { email: "avinash1@gmail.com", password: "asdfghjk" };
                form.setValue("email", creds.email);
                form.setValue("password", creds.password);
                onSubmit(creds);
              }}
            >
              Provider
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs hover:text-white"
              disabled={isPending}
              onClick={() => {
                const creds = { email: "avinashsinha751@gmail.com", password: "asdfghjk" };
                form.setValue("email", creds.email);
                form.setValue("password", creds.password);
                onSubmit(creds);
              }}
            >
              Customer
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
