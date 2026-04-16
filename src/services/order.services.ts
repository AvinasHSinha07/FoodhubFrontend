import httpClient from "../lib/axios/httpClient";
import { IResponse } from "../types/api.types";
import { IAppliedCoupon, IOrder } from "../types/order.types";
import { IMeal } from "../types/meal.types";
import { IProviderProfile } from "../types/user.types";
import { CreateOrderPayload } from "../zod/order.validation";

export type ReorderPayload = {
  provider: IProviderProfile;
  deliveryAddress: string;
  items: Array<{
    mealId: string;
    quantity: number;
    meal: IMeal;
  }>;
};

export type OrderListFilters = {
  orderStatus?: string;
  paymentStatus?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type CouponPreviewPayload = {
  providerId: string;
  couponCode: string;
  items: Array<{
    mealId: string;
    quantity: number;
  }>;
};

export type CouponPreviewResult = {
  subtotalPrice: number;
  discountAmount: number;
  totalPrice: number;
  coupon: IAppliedCoupon | null;
};

export type ExtendedCreateOrderPayload = CreateOrderPayload & {
  paymentMethod?: "STRIPE" | "COD";
  couponCode?: string;
  addressId?: string;
};

const buildOrderListQuery = (filters?: OrderListFilters) => {
  const params = new URLSearchParams();
  if (filters?.orderStatus) params.append("orderStatus", filters.orderStatus);
  if (filters?.paymentStatus) params.append("paymentStatus", filters.paymentStatus);
  if (filters?.page) params.append("page", String(filters.page));
  if (filters?.limit) params.append("limit", String(filters.limit));
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

  return params.toString();
};

const createOrder = async (data: ExtendedCreateOrderPayload): Promise<IResponse<IOrder>> => {
  return httpClient.post<IOrder, ExtendedCreateOrderPayload>("/orders", data);
};

const previewCoupon = async (payload: CouponPreviewPayload): Promise<IResponse<CouponPreviewResult>> => {
  return httpClient.post<CouponPreviewResult, CouponPreviewPayload>("/orders/coupon-preview", payload);
};

const getCustomerOrders = async (filters?: OrderListFilters): Promise<IResponse<IOrder[]>> => {
  const queryString = buildOrderListQuery(filters);
  return httpClient.get<IOrder[]>(queryString ? `/orders/my-orders?${queryString}` : "/orders/my-orders");
};

const getProviderOrders = async (filters?: OrderListFilters): Promise<IResponse<IOrder[]>> => {
  const queryString = buildOrderListQuery(filters);
  return httpClient.get<IOrder[]>(queryString ? `/orders/my-orders?${queryString}` : "/orders/my-orders");
};

const getOrderById = async (id: string): Promise<IResponse<IOrder>> => {
  return httpClient.get<IOrder>(`/orders/${id}`);
};

// Also for provider logic (can split or keep here)
const updateOrderStatus = async (id: string, status: string): Promise<IResponse<IOrder>> => {
  return httpClient.patch<IOrder, { status: string }>(`/orders/${id}/status`, { status });
};

const reorderOrder = async (id: string): Promise<IResponse<ReorderPayload>> => {
  return httpClient.post<ReorderPayload>(`/orders/${id}/reorder`);
};

export const OrderServices = {
  createOrder,
  previewCoupon,
  getCustomerOrders,
  getProviderOrders,
  getOrderById,
  updateOrderStatus,
  reorderOrder,
};
