import { IMeal } from "./meal.types";
import { IProviderProfile, IUser } from "./user.types";

export enum OrderStatus {
  PLACED = "PLACED",
  PREPARING = "PREPARING",
  READY = "READY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COD_PENDING = "COD_PENDING",
  PAID = "PAID",
  COD_COLLECTED = "COD_COLLECTED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum PaymentMethod {
  STRIPE = "STRIPE",
  COD = "COD",
}

export interface IAppliedCoupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
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
  subtotalPrice: number;
  discountAmount: number;
  totalPrice: number;
  deliveryAddress: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  couponId?: string | null;
  coupon?: IAppliedCoupon | null;
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;

  orderItems?: IOrderItem[];
  customer?: IUser;
  provider?: IProviderProfile;
}
