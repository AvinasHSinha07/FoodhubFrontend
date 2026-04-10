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
  const result = await httpClient.get("/providers/me");
  return result.data;
};

const createMyProfile = async (
  data: ICreateProviderProfilePayload
): Promise<IResponse<IProviderProfile>> => {
  const result = await httpClient.post("/providers/me", data);
  return result.data;
};

const updateMyProfile = async (
  data: Partial<ICreateProviderProfilePayload>
): Promise<IResponse<IProviderProfile>> => {
  const result = await httpClient.patch("/providers/me", data);
  return result.data;
};

export const ProviderProfileServices = {
  getMyProfile,
  createMyProfile,
  updateMyProfile,
};
