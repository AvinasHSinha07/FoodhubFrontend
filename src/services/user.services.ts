import httpClient from "../lib/axios/httpClient";
import { IResponse } from "../types/api.types";

const getMyProfile = async (): Promise<IResponse<any>> => {
  return httpClient.get<any>("/users/me");
};

const updateMyProfile = async (payload: { name?: string, profileImage?: string }): Promise<IResponse<any>> => {
  return httpClient.patch<any, { name?: string; profileImage?: string }>("/users/me", payload);
};

export const UserServices = {
  getMyProfile,
  updateMyProfile,
};
