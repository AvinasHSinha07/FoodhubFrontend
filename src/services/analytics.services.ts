import httpClient from "../lib/axios/httpClient";
import { IResponse } from "../types/api.types";

export type TProviderAnalyticsOverview = {
  provider: {
    id: string;
    restaurantName: string;
  };
  summary: {
    totalOrders: number;
    totalRevenue: number;
    gmv: number;
    providerGrossEarning: number;
    providerNetPayout: number;
    paidOrders: number;
    pendingPayments: number;
  };
  ordersByDay: Array<{ date: string; orders: number; revenue: number }>;
  paymentStatusBreakdown: Array<{ paymentStatus: string; count: number }>;
  paymentMethodBreakdown: Array<{ method: string; count: number }>;
  topMeals: Array<{ mealId: string; title: string; quantity: number; revenue: number }>;
};

const getProviderAnalyticsOverview = async (days = 30): Promise<IResponse<TProviderAnalyticsOverview>> => {
  return httpClient.get<TProviderAnalyticsOverview>(`/provider/analytics/overview?days=${days}`);
};

export const AnalyticsServices = {
  getProviderAnalyticsOverview,
};
