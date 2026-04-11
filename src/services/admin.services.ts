import httpClient from "../lib/axios/httpClient";
import { IResponse } from "../types/api.types";
import { IUser, UserStatus } from "../types/user.types";
import { IOrder } from "../types/order.types";

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

export const AdminServices = {
  getAllUsers,
  updateUserStatus,
  getAllOrders,
};
