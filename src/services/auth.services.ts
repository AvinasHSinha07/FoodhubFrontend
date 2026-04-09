"use client";

import { authClient } from "@/lib/authClient";
import { LoginFormData, RegisterFormData } from "@/zod/auth.validation";

const loginUser = async (data: LoginFormData) => {
  return await authClient.signIn.email({
    email: data.email,
    password: data.password,
  });
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
  return await authClient.signOut();
};

export const AuthServices = {
  loginUser,
  registerUser,
  logoutUser,
};
