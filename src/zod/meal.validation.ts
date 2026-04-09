import { z } from "zod";

export const createMealSchema = z.object({
  categoryId: z.string().uuid("Please select a valid category."),
  title: z.string().min(2, "Title must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  // Handling array of strings from simple comma-separated string input
  ingredients: z.string().transform((val) =>
    val
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean)
  ),
  price: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().min(0.01, "Price must be at least $0.01")),
  portionSize: z.string().min(1, "Portion size is required."),
  dietaryTag: z.string().min(1, "Dietary tag is required."),
  isAvailable: z.boolean().default(true),
  image: z.any().optional(), // File upload handling mapped via controlled state inputs not direct Zod parse
});

export type CreateMealFormData = z.infer<typeof createMealSchema>;
