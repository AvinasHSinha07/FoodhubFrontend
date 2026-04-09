import httpClient from "../lib/axios/httpClient";
import { IResponse } from "../types/api.types";
import { IMeal } from "../types/meal.types";

export interface IMealFilters {
  searchTerm?: string;
  categoryId?: string;
  providerId?: string;
  isAvailable?: boolean;
}

const getAllMeals = async (
  filters?: IMealFilters
): Promise<IResponse<IMeal[]>> => {
  const params = new URLSearchParams();
  if (filters?.searchTerm) params.append("searchTerm", filters.searchTerm);
  if (filters?.categoryId) params.append("categoryId", filters.categoryId);
  if (filters?.providerId) params.append("providerId", filters.providerId);
  if (filters?.isAvailable !== undefined)
    params.append("isAvailable", String(filters.isAvailable));

  const result = await httpClient.get(`/meals?${params.toString()}`);
  return result.data;
};

const getMealById = async (id: string): Promise<IResponse<IMeal>> => {
  const result = await httpClient.get(`/meals/${id}`);
  return result.data;
};

const createMeal = async (data: FormData): Promise<IResponse<IMeal>> => {
  const result = await httpClient.post("/provider/meals", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return result.data;
};

const deleteMeal = async (id: string): Promise<IResponse<null>> => {
  const result = await httpClient.delete(`/provider/meals/${id}`);
  return result.data;
};

export const MealServices = {
  getAllMeals,
  getMealById,
  createMeal,
  deleteMeal,
};