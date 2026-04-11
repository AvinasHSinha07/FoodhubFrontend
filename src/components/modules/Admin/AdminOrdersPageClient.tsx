"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminServices } from "@/services/admin.services";
import { IOrder, OrderStatus } from "@/types/order.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingBag, ArrowRight, UserCheck, Store } from "lucide-react";
import { queryKeys } from "@/lib/query/query-keys";

export default function AdminOrdersPageClient() {
  const [filterStatus, setFilterStatus] = useState("ALL");

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.adminOrders(),
    queryFn: () => AdminServices.getAllOrders(),
    staleTime: 1000 * 60 * 3,
  });

  const orders = (data?.data || []) as IOrder[];

  const filteredOrders = filterStatus === "ALL"
    ? orders
    : orders.filter((order) => order.orderStatus === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLACED": return "bg-blue-100 text-blue-800 border-blue-200";
      case "PREPARING": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "READY": return "bg-orange-100 text-orange-800 border-orange-200";
      case "DELIVERED": return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Monitoring</h1>
          <p className="text-gray-500">Monitor all platform food orders globally.</p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-45 bg-white">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Orders</SelectItem>
            <SelectItem value={OrderStatus.PLACED}>Placed</SelectItem>
            <SelectItem value={OrderStatus.PREPARING}>Preparing</SelectItem>
            <SelectItem value={OrderStatus.READY}>Ready</SelectItem>
            <SelectItem value={OrderStatus.DELIVERED}>Delivered</SelectItem>
            <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="text-center py-20 bg-gray-50">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h2 className="text-xl font-semibold text-gray-700">No orders found</h2>
          <p className="text-gray-500 mt-2">Adjust your filters or wait for new orders to arrive.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b bg-gray-50/30 gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">#{order.id.slice(0, 8)}</CardTitle>
                    <Badge variant="outline" className={getStatusColor(order.orderStatus)}>
                      {order.orderStatus}
                    </Badge>
                    <Badge variant="secondary" className="uppercase text-[10px] tracking-widest">
                      {order.paymentStatus}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">${order.totalPrice.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{order.orderItems?.length || 0} items</p>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="w-full md:w-5/12 bg-white border p-3 rounded-lg flex items-start gap-3 shadow-sm">
                    <div className="p-2 bg-blue-50 rounded-full text-blue-500 shrink-0">
                      <UserCheck className="h-4 w-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs uppercase font-semibold text-gray-500 tracking-wider mb-1">Customer</p>
                      <p className="font-medium text-sm truncate">{order.customer?.name || "Unknown"}</p>
                      <p className="text-xs text-gray-500 truncate">{order.customer?.email}</p>
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2 bg-gray-50 p-1.5 rounded">{order.deliveryAddress}</p>
                    </div>
                  </div>

                  <ArrowRight className="hidden md:block h-6 w-6 text-gray-300 shrink-0" />

                  <div className="w-full md:w-5/12 bg-white border p-3 rounded-lg flex items-start gap-3 shadow-sm">
                    <div className="p-2 bg-orange-50 rounded-full text-orange-500 shrink-0">
                      <Store className="h-4 w-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs uppercase font-semibold text-gray-500 tracking-wider mb-1">Provider</p>
                      <p className="font-medium text-sm truncate">{order.provider?.restaurantName || "Unknown"}</p>
                      <ul className="text-xs text-gray-600 mt-2 divide-y border-t pt-1 space-y-1 w-full">
                        {order.orderItems?.slice(0, 2).map((item, idx) => (
                          <li key={idx} className="flex justify-between items-center py-1">
                            <span className="truncate pr-2">{item.quantity}x {item.meal?.title}</span>
                            <span className="shrink-0 text-gray-400">${item.unitPrice}</span>
                          </li>
                        ))}
                        {(order.orderItems?.length || 0) > 2 && (
                          <li className="text-gray-400 italic py-1">+ {(order.orderItems?.length || 0) - 2} more items</li>
                        )}
                      </ul>
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
