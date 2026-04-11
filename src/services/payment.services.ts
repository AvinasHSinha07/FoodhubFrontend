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

export const PaymentServices = {
  createPaymentIntent,
  confirmPayment,
};
