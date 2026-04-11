import httpClient from "../lib/axios/httpClient";
import { IResponse } from "../types/api.types";

export interface ICreateReviewPayload {
  mealId: string;
  orderId: string;
  rating: number;
  comment?: string;
}

const createReview = async (data: ICreateReviewPayload): Promise<IResponse<any>> => {
  return httpClient.post<any, ICreateReviewPayload>("/reviews", data);
};

const getMealReviews = async (mealId: string): Promise<IResponse<any[]>> => {
  return httpClient.get<any[]>(`/reviews/meal/${mealId}`);
};

export const ReviewServices = {
  createReview,
  getMealReviews,
};