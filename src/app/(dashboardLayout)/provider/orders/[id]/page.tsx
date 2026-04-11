"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { OrderServices } from "@/services/order.services";
import { IOrder, OrderStatus } from "@/types/order.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const getAllowedTransitions = (currentStatus: OrderStatus): OrderStatus[] => {
  switch (currentStatus) {
    case OrderStatus.PLACED:
      return [OrderStatus.PREPARING, OrderStatus.CANCELLED];
    case OrderStatus.PREPARING:
      return [OrderStatus.READY, OrderStatus.CANCELLED];
    case OrderStatus.READY:
      return [OrderStatus.DELIVERED, OrderStatus.CANCELLED];
    default:
      return [];
  }
};

export default function ProviderOrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      if (!params.id) {
        return;
      }

      try {
        const response = await OrderServices.getOrderById(params.id);
        setOrder(response.data);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [params.id]);

  const nextStatuses = useMemo(() => {
    if (!order) {
      return [];
    }

    return getAllowedTransitions(order.orderStatus);
  }, [order]);

  const handleUpdateStatus = async (status: OrderStatus) => {
    if (!order) {
      return;
    }

    setIsUpdating(true);
    try {
      const response = await OrderServices.updateOrderStatus(order.id, status);
      setOrder(response.data);
      toast.success(`Order updated to ${status}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update order status");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <Card className="max-w-3xl mx-auto mt-10 p-8 text-center">
        <h2 className="text-xl font-semibold">Order not found</h2>
        <p className="text-gray-500 mt-2">This order may not exist or you may not have access.</p>
        <Button asChild className="mt-6">
          <Link href="/provider/orders">Back to Orders</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Manage Order #{order.id.slice(-6)}</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm px-3 py-1">{order.orderStatus}</Badge>
          <Select
            value={order.orderStatus}
            onValueChange={(value) => handleUpdateStatus(value as OrderStatus)}
            disabled={isUpdating || nextStatuses.length === 0}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Update status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={order.orderStatus}>{order.orderStatus}</SelectItem>
              {nextStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
            <CardDescription>Items to prepare</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.orderItems?.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm font-medium">
                <span>
                  {item.quantity}x {item.meal?.title || "Meal"}
                </span>
                <span>${item.totalPrice.toFixed(2)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span>${order.totalPrice.toFixed(2)}</span>
            </div>
            <p className="text-xs uppercase text-gray-500 tracking-wide">Payment Status: {order.paymentStatus}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Info</CardTitle>
            <CardDescription>Delivery destination</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-muted-foreground">
            <p className="font-medium text-foreground">{order.customer?.name || "Customer"}</p>
            <p>{order.customer?.email}</p>
            <p>{order.deliveryAddress}</p>
            <p className="text-xs text-gray-500 pt-3 border-t border-dashed">
              Ordered at: {new Date(order.createdAt).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Button asChild variant="outline">
        <Link href="/provider/orders">Back to Orders</Link>
      </Button>
    </div>
  );
}
