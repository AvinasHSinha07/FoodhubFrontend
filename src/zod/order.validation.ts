import { z } from "zod";

export const createOrderItemSchema = z.object({
  mealId: z.string().uuid("Invalid meal format"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
});

export const createOrderSchema = z.object({
  providerId: z.string().uuid("Invalid restaurant ID"),
  deliveryAddress: z.string().min(5, "Delivery address is required"),
  items: z.array(createOrderItemSchema).min(1, "Cart cannot be empty"),
});

export type CreateOrderPayload = z.infer<typeof createOrderSchema>;
