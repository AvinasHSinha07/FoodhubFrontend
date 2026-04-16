import { z } from "zod";

const availabilityWindowSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  closeTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  isClosed: z.boolean().optional(),
});

export const createProviderProfileSchema = z.object({
  restaurantName: z.string().min(2, "Restaurant name must be at least 2 characters."),
  description: z.string().optional(),
  address: z.string().min(5, "Address must be at least 5 characters."),
  cuisineType: z.string().optional(),
  preparationTimeMinutes: z.number().int().min(5).max(180).optional(),
  timezone: z.string().optional(),
  logo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  bannerImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  availabilityWindows: z.array(availabilityWindowSchema).max(7).optional(),
});

export type CreateProviderProfileFormData = z.infer<typeof createProviderProfileSchema>;

export const updateProviderProfileSchema = createProviderProfileSchema.partial();

export type UpdateProviderProfileFormData = z.infer<typeof updateProviderProfileSchema>;
