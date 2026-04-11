import httpClient from "../lib/axios/httpClient";
import { IResponse } from "../types/api.types";
import { IUser, UserStatus } from "../types/user.types";
import { IOrder } from "../types/order.types";

const getAllUsers = async (filters?: {
  role?: string;
  status?: string;
  searchTerm?: string;
}): Promise<IResponse<IUser[]>> => {
  const params = new URLSearchParams();
  if (filters?.role) params.append("role", filters.role);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.searchTerm) params.append("searchTerm", filters.searchTerm);

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

const getAllOrders = async (): Promise<IResponse<IOrder[]>> => {
  return httpClient.get<IOrder[]>("/admin/orders");
};

export const AdminServices = {
  getAllUsers,
  updateUserStatus,
  getAllOrders,
};
