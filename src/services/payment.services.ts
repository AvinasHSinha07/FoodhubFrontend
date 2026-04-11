import httpClient from "../lib/axios/httpClient";
import { IResponse } from "../types/api.types";

const createPaymentIntent = async (
  orderId: string
): Promise<IResponse<{ clientSecret: string; paymentIntentId: string }>> => {
  const result = await httpClient.post("/payments/create-intent", {
    orderId,
  });
  return result.data;
};

const confirmPayment = async (
  orderId: string,
  paymentIntentId: string
): Promise<IResponse<null>> => {
  const result = await httpClient.post("/payments/confirm", {
    orderId,
    paymentIntentId,
  });
  return result.data;
};

export const PaymentServices = {
  createPaymentIntent,
  confirmPayment,
};
