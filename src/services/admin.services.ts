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

  const result = await httpClient.get(`/admin/users?${params.toString()}`);
  return result.data;
};

const updateUserStatus = async (
  id: string,
  status: UserStatus
): Promise<IResponse<IUser>> => {
  const result = await httpClient.patch(`/admin/users/${id}/status`, {
    status,
  });
  return result.data;
};

const getAllOrders = async (): Promise<IResponse<IOrder[]>> => {
  const result = await httpClient.get("/admin/orders");
  return result.data;
};

export const AdminServices = {
  getAllUsers,
  updateUserStatus,
  getAllOrders,
};
