import { createAuthClient } from "better-auth/react";

const isClient = typeof window !== "undefined";

const fallbackApiUrl = "http://localhost:5000/api/v1";
const configuredApiUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  fallbackApiUrl;

// Ensure proxy path is used in browser so cookies are set securely on the frontend domain
const baseURL = isClient ? window.location.origin : new URL(configuredApiUrl).origin;
const basePath = isClient ? "/api/v1/auth" : new URL(configuredApiUrl).pathname + "/auth";

export const authClient = createAuthClient({
  baseURL,
  basePath,
});