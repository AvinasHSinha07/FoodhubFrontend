import { z } from "zod";

export const createOrderItemSchema = z.object({
  mealId: z.string().uuid("Invalid meal format"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
});

export const createOrderSchema = z.object({
  providerId: z.string().uuid("Invalid restaurant ID"),
  deliveryAddress: z.string().optional(),
  addressId: z.string().uuid().optional(),
  paymentMethod: z.enum(["STRIPE", "COD"]).optional(),
  couponCode: z.string().optional(),
  items: z.array(createOrderItemSchema).min(1, "Cart cannot be empty"),
}).refine(
  (data) => Boolean((data.deliveryAddress || "").trim() || data.addressId),
  {
    message: "Delivery address is required",
    path: ["deliveryAddress"],
  }
);

export type CreateOrderPayload = z.infer<typeof createOrderSchema>;
