import httpClient from "../lib/axios/httpClient";
import { IResponse } from "../types/api.types";

export interface ICreateReviewPayload {
  mealId: string;
  orderId: string;
  rating: number;
  comment?: string;
}

const createReview = async (data: ICreateReviewPayload): Promise<IResponse<any>> => {
  const result = await httpClient.post("/reviews", data);
  return result.data;
};

const getMealReviews = async (mealId: string): Promise<IResponse<any[]>> => {
  const result = await httpClient.get(`/reviews/meal/${mealId}`);
  return result.data;
};

export const ReviewServices = {
  createReview,
  getMealReviews,
};