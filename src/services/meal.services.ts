import httpClient from "../lib/axios/httpClient";
import { IResponse } from "../types/api.types";
import { IMeal } from "../types/meal.types";

export interface IMealFilters {
  searchTerm?: string;
  categoryId?: string;
  providerId?: string;
  isAvailable?: boolean;
  minPrice?: number;
  maxPrice?: number;
  dietaryTag?: string;
}

export interface ICreateMealPayload {
  categoryId: string;
  title: string;
  description: string;
  price: number;
  image?: string;
  isAvailable?: boolean;
  dietaryTag?: string;
}

const getAllMeals = async (
  filters?: IMealFilters
): Promise<IResponse<IMeal[]>> => {
  const params = new URLSearchParams();
  if (filters?.searchTerm) params.append("searchTerm", filters.searchTerm);
  if (filters?.categoryId) params.append("categoryId", filters.categoryId);
  if (filters?.providerId) params.append("providerId", filters.providerId);
  if (filters?.minPrice !== undefined) params.append("minPrice", String(filters.minPrice));
  if (filters?.maxPrice !== undefined) params.append("maxPrice", String(filters.maxPrice));
  if (filters?.dietaryTag) params.append("dietaryTag", filters.dietaryTag);
  if (filters?.isAvailable !== undefined) params.append("isAvailable", String(filters.isAvailable));

  return httpClient.get<IMeal[]>(`/meals?${params.toString()}`);
};

const getMealById = async (id: string): Promise<IResponse<IMeal>> => {
  return httpClient.get<IMeal>(`/meals/${id}`);
};

const createMeal = async (data: ICreateMealPayload): Promise<IResponse<IMeal>> => {
  return httpClient.post<IMeal, ICreateMealPayload>("/meals", data);
};

const deleteMeal = async (id: string): Promise<IResponse<null>> => {
  return httpClient.delete<null>(`/meals/${id}`);
};

const updateMeal = async (id: string, data: Partial<ICreateMealPayload>): Promise<IResponse<IMeal>> => {
  return httpClient.patch<IMeal, Partial<ICreateMealPayload>>(`/meals/${id}`, data);
};

export const MealServices = {
  getAllMeals,
  getMealById,
  createMeal,
  updateMeal,
  deleteMeal,
};
