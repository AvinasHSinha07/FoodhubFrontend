import { IMeal } from "./meal.types";
import { IProviderProfile, IUser } from "./user.types";

export enum OrderStatus {
  PLACED = "PLACED",
  PREPARING = "PREPARING",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
}

export interface IOrderItem {
  id: string;
  orderId: string;
  mealId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  meal?: IMeal; // Relational
}

export interface IOrder {
  id: string;
  customerId: string;
  providerId: string;
  totalPrice: number;
  deliveryAddress: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;

  orderItems?: IOrderItem[];
  customer?: IUser;
  provider?: IProviderProfile;
}
