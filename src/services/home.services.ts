import httpClient from "../lib/axios/httpClient";
import { IResponse } from "../types/api.types";

export type THomeSummary = {
  featuredCategories: any[];
  featuredMeals: any[];
  topProviders: any[];
  testimonials: any[];
  stats: {
    totalUsers: number;
    totalProviders: number;
    totalAvailableMeals: number;
    totalOrders: number;
  };
};

const getHomeSummary = async (): Promise<IResponse<THomeSummary>> => {
  return httpClient.get<THomeSummary>("/home/summary");
};

export const HomeServices = {
  getHomeSummary,
};
