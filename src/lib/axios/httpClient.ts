import axios, { AxiosRequestConfig } from "axios";
import { ApiResponse } from "@/types/api.types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

type RequestOptions = {
  cookieHeader?: string;
};

const getServerCookieHeader = async (): Promise<string | undefined> => {
  if (typeof window !== "undefined") {
    return undefined;
  }

  try {
    const { headers } = await import("next/headers");
    const requestHeaders = await headers();
    const cookieHeader = requestHeaders.get("cookie");
    return cookieHeader || undefined;
  } catch {
    return undefined;
  }
};

const withCookieHeader = async (
  config: AxiosRequestConfig,
  options?: RequestOptions
): Promise<AxiosRequestConfig> => {
  const cookieHeader = options?.cookieHeader || (await getServerCookieHeader());

  if (!cookieHeader) {
    return config;
  }

  return {
    ...config,
    headers: {
      ...config.headers,
      cookie: cookieHeader,
    },
  };
};

const request = async <T>(
  config: AxiosRequestConfig,
  options?: RequestOptions
): Promise<ApiResponse<T>> => {
  const response = await axiosInstance.request<ApiResponse<T>>(await withCookieHeader(config, options));

  return response.data;
};

export const httpClient = {
  get: <T>(url: string, options?: RequestOptions, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: "GET", url }, options),

  post: <T, B = unknown>(
    url: string,
    body?: B,
    options?: RequestOptions,
    config?: AxiosRequestConfig
  ) => request<T>({ ...config, method: "POST", url, data: body }, options),

  put: <T, B = unknown>(
    url: string,
    body?: B,
    options?: RequestOptions,
    config?: AxiosRequestConfig
  ) => request<T>({ ...config, method: "PUT", url, data: body }, options),

  patch: <T, B = unknown>(
    url: string,
    body?: B,
    options?: RequestOptions,
    config?: AxiosRequestConfig
  ) => request<T>({ ...config, method: "PATCH", url, data: body }, options),

  delete: <T>(url: string, options?: RequestOptions, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: "DELETE", url }, options),

  raw: axiosInstance,
  apiBaseUrl: API_BASE_URL,
};

export default httpClient;