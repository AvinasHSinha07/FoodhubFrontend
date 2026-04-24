import { z } from "zod";

export const createReviewSchema = z.object({
  mealId: z.string().min(1, "Meal is required"),
  orderItemId: z.string().min(1, "Order item is required"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating can be at most 5"),
  comment: z
    .string()
    .max(500, "Comment can be up to 500 characters")
    .optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
