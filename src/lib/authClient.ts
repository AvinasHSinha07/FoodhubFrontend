import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1", // Must match exactly where backend `better-auth/node` is mounted
});