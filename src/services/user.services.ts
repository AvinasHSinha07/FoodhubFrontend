import httpClient from "../lib/axios/httpClient";
import { IResponse } from "../types/api.types";

const getMyProfile = async (): Promise<IResponse<any>> => {
  const result = await httpClient.get("/users/me");
  return result.data;
};

const updateMyProfile = async (payload: { name?: string, profileImage?: string }): Promise<IResponse<any>> => {
  const result = await httpClient.patch("/users/me", payload);
  return result.data;
};

export const UserServices = {
  getMyProfile,
  updateMyProfile,
};
