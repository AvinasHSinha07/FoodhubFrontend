import httpClient from "../lib/axios/httpClient";
import { IResponse } from "../types/api.types";

const getMealFavorites = async (params?: { page?: number; limit?: number }): Promise<IResponse<any[]>> => {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));

  return httpClient.get<any[]>(`/favorites/meals?${query.toString()}`);
};

const getProviderFavorites = async (params?: { page?: number; limit?: number }): Promise<IResponse<any[]>> => {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));

  return httpClient.get<any[]>(`/favorites/providers?${query.toString()}`);
};

const toggleMealFavorite = async (mealId: string): Promise<IResponse<{ favorited: boolean }>> => {
  return httpClient.post<{ favorited: boolean }>(`/favorites/meals/${mealId}/toggle`);
};

const toggleProviderFavorite = async (providerId: string): Promise<IResponse<{ favorited: boolean }>> => {
  return httpClient.post<{ favorited: boolean }>(`/favorites/providers/${providerId}/toggle`);
};

const getMealFavoriteState = async (mealId: string): Promise<IResponse<{ favorited: boolean }>> => {
  return httpClient.get<{ favorited: boolean }>(`/favorites/meals/${mealId}/state`);
};

const getProviderFavoriteState = async (providerId: string): Promise<IResponse<{ favorited: boolean }>> => {
  return httpClient.get<{ favorited: boolean }>(`/favorites/providers/${providerId}/state`);
};

export const FavoriteServices = {
  getMealFavorites,
  getProviderFavorites,
  toggleMealFavorite,
  toggleProviderFavorite,
  getMealFavoriteState,
  getProviderFavoriteState,
};
