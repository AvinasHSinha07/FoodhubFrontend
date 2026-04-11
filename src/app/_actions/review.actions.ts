"use server";

import { getActionErrorMessage } from "@/app/_actions/action-error";
import { ReviewServices } from "@/services/review.services";
import { ApiErrorResponse, ApiResponse } from "@/types/api.types";
import { createReviewSchema, CreateReviewInput } from "@/zod/review.validation";

export const createReviewAction = async (
  payload: unknown
): Promise<ApiResponse<unknown> | ApiErrorResponse> => {
  const parsedPayload = createReviewSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return {
      success: false,
      message: parsedPayload.error.issues[0]?.message || "Invalid review input",
    };
  }

  try {
    return await ReviewServices.createReview(parsedPayload.data as CreateReviewInput);
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to submit review"),
    };
  }
};
