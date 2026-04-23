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
      </form>
    </Form>
  );
}
