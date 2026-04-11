import httpClient from "../lib/axios/httpClient";
import { IResponse } from "../types/api.types";
import { IProviderProfile } from "../types/user.types";

export interface ICreateProviderProfilePayload {
  restaurantName: string;
  description?: string;
  address: string;
  cuisineType?: string;
  logo?: string;
  bannerImage?: string;
}

const getMyProfile = async (): Promise<IResponse<IProviderProfile>> => {
  return httpClient.get<IProviderProfile>("/providers/me");
};

const createMyProfile = async (
  data: ICreateProviderProfilePayload
): Promise<IResponse<IProviderProfile>> => {
  return httpClient.post<IProviderProfile, ICreateProviderProfilePayload>("/providers/me", data);
};

const updateMyProfile = async (
  data: Partial<ICreateProviderProfilePayload>
): Promise<IResponse<IProviderProfile>> => {
  return httpClient.patch<IProviderProfile, Partial<ICreateProviderProfilePayload>>("/providers/me", data);
};

const getAllProviders = async (
  params?: {
    searchTerm?: string;
    cuisineType?: string;
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }
): Promise<IResponse<IProviderProfile[]>> => {
  const query = new URLSearchParams();
  if (params?.searchTerm) query.append("search", params.searchTerm);
  if (params?.cuisineType) query.append("cuisineType", params.cuisineType);
  if (params?.status) query.append("status", params.status);
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.sortBy) query.append("sortBy", params.sortBy);
  if (params?.sortOrder) query.append("sortOrder", params.sortOrder);

  const queryString = query.toString();
  const path = queryString ? `/providers?${queryString}` : "/providers";

  return httpClient.get<IProviderProfile[]>(path);
};

const getProviderById = async (id: string): Promise<IResponse<IProviderProfile>> => {
  return httpClient.get<IProviderProfile>(`/providers/${id}`);
};

export const ProviderProfileServices = {
  getMyProfile,
  createMyProfile,
  updateMyProfile,
  getAllProviders,
  getProviderById,
};
