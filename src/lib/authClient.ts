import { createAuthClient } from "better-auth/react";

const fallbackApiUrl = "http://localhost:5000/api/v1";
const configuredApiUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  fallbackApiUrl;
const authServerOrigin = new URL(configuredApiUrl).origin;

export const authClient = createAuthClient({
  baseURL: authServerOrigin,
  basePath: "/api/v1/auth",
});