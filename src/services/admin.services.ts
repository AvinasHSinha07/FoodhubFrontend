import httpClient from "../lib/axios/httpClient";
import { IResponse } from "../types/api.types";
import { IUser, UserStatus } from "../types/user.types";
import { IOrder } from "../types/order.types";

export type CouponDiscountType = "PERCENTAGE" | "FIXED";

export interface IAdminCoupon {
  id: string;
  code: string;
  description?: string | null;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  perUserLimit: number;
  isActive: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
  providerId?: string | null;
  createdAt: string;
  updatedAt: string;
  provider?: {
    id: string;
    restaurantName: string;
  } | null;
}

export interface ICouponPayload {
  code: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  isActive?: boolean;
  startsAt?: string;
  expiresAt?: string;
  providerId?: string;
}

export type AnalyticsOverview = {
  summary: {
    totalOrders: number;
    totalRevenue: number;
    gmv: number;
    adminGrossRevenue: number;
    adminNetRevenue: number;
    paidOrders: number;
    pendingPayments: number;
  };
  ordersByDay: Array<{ date: string; orders: number; revenue: number }>;
  paymentMethodBreakdown: Array<{ method: string; count: number }>;
  paymentStatusBreakdown: Array<{ paymentStatus: string; count: number }>;
  orderStatusBreakdown: Array<{ orderStatus: string; count: number }>;
  topProviders: Array<{ providerId: string; restaurantName: string; orders: number; revenue: number }>;
};

const getAllUsers = async (filters?: {
  role?: string;
  status?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<IResponse<IUser[]>> => {
  const params = new URLSearchParams();
  if (filters?.role) params.append("role", filters.role);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.searchTerm) params.append("searchTerm", filters.searchTerm);
  if (filters?.page) params.append("page", String(filters.page));
  if (filters?.limit) params.append("limit", String(filters.limit));
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

  return httpClient.get<IUser[]>(`/admin/users?${params.toString()}`);
};

const updateUserStatus = async (
  id: string,
  status: UserStatus
): Promise<IResponse<IUser>> => {
  return httpClient.patch<IUser, { status: UserStatus }>(`/admin/users/${id}/status`, {
    status,
  });
};

const getAllOrders = async (filters?: {
  orderStatus?: string;
  paymentStatus?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<IResponse<IOrder[]>> => {
  const params = new URLSearchParams();
  if (filters?.orderStatus) params.append("orderStatus", filters.orderStatus);
  if (filters?.paymentStatus) params.append("paymentStatus", filters.paymentStatus);
  if (filters?.page) params.append("page", String(filters.page));
  if (filters?.limit) params.append("limit", String(filters.limit));
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

  return httpClient.get<IOrder[]>(`/admin/orders?${params.toString()}`);
};

const getCoupons = async (filters?: {
  searchTerm?: string;
  isActive?: string;
  providerId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<IResponse<IAdminCoupon[]>> => {
  const params = new URLSearchParams();
  if (filters?.searchTerm) params.append("search", filters.searchTerm);
  if (filters?.isActive) params.append("isActive", filters.isActive);
  if (filters?.providerId) params.append("providerId", filters.providerId);
  if (filters?.page) params.append("page", String(filters.page));
  if (filters?.limit) params.append("limit", String(filters.limit));
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

  return httpClient.get<IAdminCoupon[]>(`/admin/coupons?${params.toString()}`);
};

const createCoupon = async (payload: ICouponPayload): Promise<IResponse<IAdminCoupon>> => {
  return httpClient.post<IAdminCoupon, ICouponPayload>("/admin/coupons", payload);
};

const updateCoupon = async (
  couponId: string,
  payload: Partial<ICouponPayload>
): Promise<IResponse<IAdminCoupon>> => {
  return httpClient.patch<IAdminCoupon, Partial<ICouponPayload>>(`/admin/coupons/${couponId}`, payload);
};

const deleteCoupon = async (couponId: string): Promise<IResponse<IAdminCoupon>> => {
  return httpClient.delete<IAdminCoupon>(`/admin/coupons/${couponId}`);
};

const getAdminAnalyticsOverview = async (days = 30): Promise<IResponse<AnalyticsOverview>> => {
  return httpClient.get<AnalyticsOverview>(`/admin/analytics/overview?days=${days}`);
};

const getAdminAiInsights = async (days = 30): Promise<IResponse<{ insight: string }>> => {
  return httpClient.get<{ insight: string }>(`/admin/analytics/ai-insights?days=${days}`);
};

export const AdminServices = {
  getAllUsers,
  updateUserStatus,
  getAllOrders,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAdminAnalyticsOverview,
  getAdminAiInsights,
};
