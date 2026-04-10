import { z } from "zod";

export const createProviderProfileSchema = z.object({
  restaurantName: z.string().min(2, "Restaurant name must be at least 2 characters."),
  description: z.string().optional(),
  address: z.string().min(5, "Address must be at least 5 characters."),
  cuisineType: z.string().optional(),
  logo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  bannerImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type CreateProviderProfileFormData = z.infer<typeof createProviderProfileSchema>;

export const updateProviderProfileSchema = createProviderProfileSchema.partial();

export type UpdateProviderProfileFormData = z.infer<typeof updateProviderProfileSchema>;
