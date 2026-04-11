import httpClient from "../lib/axios/httpClient";
import { IResponse } from "../types/api.types";
import { IOrder } from "../types/order.types";
import { CreateOrderPayload } from "../zod/order.validation";

const createOrder = async (data: CreateOrderPayload): Promise<IResponse<IOrder>> => {
  return httpClient.post<IOrder, CreateOrderPayload>("/orders", data);
};

const getCustomerOrders = async (): Promise<IResponse<IOrder[]>> => {
  return httpClient.get<IOrder[]>("/orders/my-orders");
};

const getOrderById = async (id: string): Promise<IResponse<IOrder>> => {
  return httpClient.get<IOrder>(`/orders/${id}`);
};

// Also for provider logic (can split or keep here)
const updateOrderStatus = async (id: string, status: string): Promise<IResponse<IOrder>> => {
  return httpClient.patch<IOrder, { status: string }>(`/orders/${id}/status`, { status });
};

export const OrderServices = {
  createOrder,
  getCustomerOrders,
  getOrderById,
  updateOrderStatus
};
