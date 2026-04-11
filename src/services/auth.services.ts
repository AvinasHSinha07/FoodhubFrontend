"use client";

import { authClient } from "@/lib/authClient";
import { LoginFormData, RegisterFormData } from "@/zod/auth.validation";
import { deleteCookie, setCookie } from "cookies-next";

const loginUser = async (data: LoginFormData) => {
  const result = await authClient.signIn.email({
    email: data.email,
    password: data.password,
  });

  const role =
    (result as any)?.data?.user?.role ||
    (result as any)?.user?.role;

  if (role) {
    setCookie("userRole", role, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
    });
  }

  return result;
};

const registerUser = async (data: RegisterFormData) => {
  return await authClient.signUp.email({
    email: data.email,
    password: data.password,
    name: data.name,
    role: data.role,
  } as any);
};

const logoutUser = async () => {
  const result = await authClient.signOut();
  deleteCookie("userRole", { path: "/" });
  return result;
};

export const AuthServices = {
  loginUser,
  registerUser,
  logoutUser,
};
