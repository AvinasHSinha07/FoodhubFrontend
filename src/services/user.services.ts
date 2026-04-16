import httpClient from "../lib/axios/httpClient";
import { IResponse } from "../types/api.types";
import { ICustomerAddress } from "../types/user.types";

export type CustomerAddressPayload = {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  instructions?: string;
  isDefault?: boolean;
};

const getMyProfile = async (): Promise<IResponse<any>> => {
  return httpClient.get<any>("/users/me");
};

const updateMyProfile = async (payload: { name?: string, profileImage?: string }): Promise<IResponse<any>> => {
  return httpClient.patch<any, { name?: string; profileImage?: string }>("/users/me", payload);
};

const getMyAddresses = async (): Promise<IResponse<ICustomerAddress[]>> => {
  return httpClient.get<ICustomerAddress[]>("/users/me/addresses");
};

const createAddress = async (payload: CustomerAddressPayload): Promise<IResponse<ICustomerAddress>> => {
  return httpClient.post<ICustomerAddress, CustomerAddressPayload>("/users/me/addresses", payload);
};

const updateAddress = async (
  id: string,
  payload: Partial<CustomerAddressPayload>
): Promise<IResponse<ICustomerAddress>> => {
  return httpClient.patch<ICustomerAddress, Partial<CustomerAddressPayload>>(`/users/me/addresses/${id}`, payload);
};

const setDefaultAddress = async (id: string): Promise<IResponse<ICustomerAddress>> => {
  return httpClient.patch<ICustomerAddress>(`/users/me/addresses/${id}/default`);
};

const deleteAddress = async (id: string): Promise<IResponse<{ deleted: boolean }>> => {
  return httpClient.delete<{ deleted: boolean }>(`/users/me/addresses/${id}`);
};

export const UserServices = {
  getMyProfile,
  updateMyProfile,
  getMyAddresses,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
};
