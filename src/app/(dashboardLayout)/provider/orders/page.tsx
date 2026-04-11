"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OrderServices } from "@/services/order.services";
import { IOrder, OrderStatus } from "@/types/order.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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

export default function ProviderOrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Backend uses the same endpoint for provider and customer: /orders/my-orders
      const response = await OrderServices.getCustomerOrders();
      setOrders(response.data || []);
    } catch (error) {
      toast.error("Failed to load restaurant orders.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await OrderServices.updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus as OrderStatus } : o))
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLACED": return "bg-blue-100 text-blue-800";
      case "PREPARING": return "bg-yellow-100 text-yellow-800";
      case "READY": return "bg-orange-100 text-orange-800";
      case "DELIVERED": return "bg-green-100 text-green-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Orders</h1>
        <p className="text-gray-500">View and update incoming customer orders.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : orders.length === 0 ? (
        <Card className="text-center py-20 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-700">No Orders Yet</h2>
          <p className="text-gray-500 mt-2">When customers place orders, they will appear here.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 bg-gray-50/50 gap-4">
                <div>
                  <CardTitle className="text-lg">
                    Order #{order.id.slice(0, 8)}
                  </CardTitle>
                  <CardDescription className="text-xs pt-1">
                    Placed on: {new Date(order.createdAt).toLocaleString()}
                    <br />
                    Customer: {order.customer?.name || "Unknown"} ({order.customer?.email})
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">
                      Payment: {order.paymentStatus}
                    </p>
                  </div>
                  <Select
                    defaultValue={order.orderStatus}
                    onValueChange={(val) => handleStatusChange(order.id, val)}
                    disabled={updatingId === order.id || getAllowedTransitions(order.orderStatus).length === 0}
                  >
                    <SelectTrigger className={`w-[140px] font-medium border ${getStatusColor(order.orderStatus)}`}>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={order.orderStatus}>{order.orderStatus}</SelectItem>
                      {getAllowedTransitions(order.orderStatus).map((nextStatus) => (
                        <SelectItem key={nextStatus} value={nextStatus}>
                          {nextStatus}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold border-b pb-2">Order Items</h4>
                    {order.orderItems?.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <div className="flex gap-3 items-center">
                          <span className="font-medium px-2 py-0.5 bg-gray-100 rounded text-xs border">
                            {item.quantity}x
                          </span>
                          <span>{item.meal?.title || "Unknown Meal"}</span>
                        </div>
                        <span className="text-gray-600">${item.unitPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg border">
                    <h4 className="text-sm font-semibold border-b pb-2">Delivery Info</h4>
                    <p className="text-sm whitespace-pre-wrap">{order.deliveryAddress}</p>
                    <div className="pt-4 mt-auto">
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total</span>
                        <span>${order.totalPrice.toFixed(2)}</span>
                      </div>
                      <Button asChild variant="outline" className="w-full mt-4">
                        <Link href={`/provider/orders/${order.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
