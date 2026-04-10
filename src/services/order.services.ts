import httpClient from "../lib/axios/httpClient";
import { IResponse } from "../types/api.types";
import { IOrder } from "../types/order.types";
import { CreateOrderPayload } from "../zod/order.validation";

const createOrder = async (data: CreateOrderPayload): Promise<IResponse<IOrder>> => {
  const result = await httpClient.post("/orders", data);
  return result.data;
};

const getCustomerOrders = async (): Promise<IResponse<IOrder[]>> => {
  const result = await httpClient.get("/orders/my-orders");
  return result.data;
};

const getOrderById = async (id: string): Promise<IResponse<IOrder>> => {
  const result = await httpClient.get(`/orders/${id}`);
  return result.data;
};

// Also for provider logic (can split or keep here)
const updateOrderStatus = async (id: string, status: string): Promise<IResponse<IOrder>> => {
  const result = await httpClient.patch(`/orders/${id}/status`, { orderStatus: status });
  return result.data;
};

export const OrderServices = {
  createOrder,
  getCustomerOrders,
  getOrderById,
  updateOrderStatus
};
