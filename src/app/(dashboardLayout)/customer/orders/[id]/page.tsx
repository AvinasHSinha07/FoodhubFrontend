"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { OrderServices } from "@/services/order.services";
import { IOrder } from "@/types/order.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const getStatusBadgeClass = (status: string) => {
  if (status === "DELIVERED") {
    return "bg-green-100 text-green-800 border-green-200";
  }

  if (status === "CANCELLED") {
    return "bg-red-100 text-red-800 border-red-200";
  }

  if (status === "READY") {
    return "bg-orange-100 text-orange-800 border-orange-200";
  }

  if (status === "PREPARING") {
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }

  return "bg-blue-100 text-blue-800 border-blue-200";
};

export default function CustomerOrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          <Link href="/customer/orders">Back to My Orders</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Order #{order.id.slice(-6)}</h1>
        <Badge variant="outline" className={getStatusBadgeClass(order.orderStatus)}>
          {order.orderStatus}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Items in this order</CardDescription>
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
            <CardTitle>Delivery Info</CardTitle>
            <CardDescription>Where your order is being delivered</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-muted-foreground">
            <p className="font-medium text-foreground">{order.customer?.name || "Customer"}</p>
            <p>{order.deliveryAddress}</p>
            <p className="text-xs text-gray-500 pt-3 border-t border-dashed">
              Ordered at: {new Date(order.createdAt).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Button asChild variant="outline">
        <Link href="/customer/orders">Back to Orders</Link>
      </Button>
    </div>
  );
}
