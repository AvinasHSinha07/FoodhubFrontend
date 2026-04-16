import httpClient from "../lib/axios/httpClient";
import { IResponse } from "../types/api.types";

const createPaymentIntent = async (
  orderId: string
): Promise<IResponse<{ clientSecret: string; paymentIntentId: string }>> => {
  return httpClient.post<{ clientSecret: string; paymentIntentId: string }, { orderId: string }>("/payments/create-intent", {
    orderId,
  });
};

const confirmPayment = async (
  orderId: string,
  paymentIntentId: string
): Promise<IResponse<null>> => {
  return httpClient.post<null, { orderId: string; paymentIntentId: string }>("/payments/confirm", {
    orderId,
    paymentIntentId,
  });
};

const collectCodPayment = async (orderId: string): Promise<IResponse<any>> => {
  return httpClient.post<any, { orderId: string }>("/payments/cod/collect", {
    orderId,
  });
};

export const PaymentServices = {
  createPaymentIntent,
  confirmPayment,
  collectCodPayment,
};
