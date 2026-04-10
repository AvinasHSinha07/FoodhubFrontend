import { z } from "zod";

export const createMealSchema = z.object({
  categoryId: z.string().uuid("Please select a valid category."),
  title: z.string().min(2, "Title must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.number().min(0.01, "Price must be at least $0.01"),
  dietaryTag: z.string().optional(),
  image: z.string().optional(),
  isAvailable: z.boolean(),
});

export type CreateMealFormData = z.infer<typeof createMealSchema>;
