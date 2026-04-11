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

const getAllProviders = async (queryString = ""): Promise<IResponse<IProviderProfile[]>> => {
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
