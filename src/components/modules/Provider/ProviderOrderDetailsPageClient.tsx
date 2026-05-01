"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { OrderServices } from "@/services/order.services";
import { IOrder, OrderStatus, PaymentMethod, PaymentStatus } from "@/types/order.types";
import { PaymentServices } from "@/services/payment.services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryKeys } from "@/lib/query/query-keys";

type ProviderOrderDetailsPageClientProps = {
  orderId: string;
};

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

export default function ProviderOrderDetailsPageClient({ orderId }: ProviderOrderDetailsPageClientProps) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.order(orderId),
    queryFn: () => OrderServices.getOrderById(orderId),
    staleTime: 1000 * 60 * 2,
  });

  const order = (data?.data || null) as IOrder | null;

  const nextStatuses = useMemo(() => {
    if (!order) {
      return [];
    }

    return getAllowedTransitions(order.orderStatus);
  }, [order]);

  const { mutateAsync: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: (status: OrderStatus) => OrderServices.updateOrderStatus(orderId, status),
  });

  const { mutateAsync: collectCodPayment, isPending: isCollectingCod } = useMutation({
    mutationFn: () => PaymentServices.collectCodPayment(orderId),
  });

  const handleUpdateStatus = async (status: OrderStatus) => {
    try {
      await updateStatus(status);
      await queryClient.invalidateQueries({ queryKey: queryKeys.order(orderId) });
      await queryClient.invalidateQueries({ queryKey: ["provider-orders"] });
      toast.success(`Order updated to ${status}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update order status");
    }
  };

  const handleCollectCod = async () => {
    try {
      await collectCodPayment();
      await queryClient.invalidateQueries({ queryKey: queryKeys.order(orderId) });
      await queryClient.invalidateQueries({ queryKey: ["provider-orders"] });
      toast.success("COD payment marked as collected.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to collect COD payment");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-[400px] w-full rounded-[24px]" />
          <Skeleton className="h-[200px] w-full rounded-[24px]" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card className="text-center py-24 bg-background border-border/50 rounded-[24px] shadow-sm">
          <h2 className="text-2xl font-extrabold text-foreground">Order Not Found</h2>
          <p className="text-slate-500 font-medium mt-2">This order may not exist or you may not have access.</p>
          <Button asChild className="mt-8 h-12 px-8 rounded-[14px] bg-[#377771] dark:bg-[#4CE0B3] hover:bg-[#4CE0B3] dark:hover:bg-[#377771] text-white dark:text-emerald-950 dark:hover:text-white font-bold transition-all shadow-md hover:-translate-y-0.5">
            <Link href="/provider/orders">Back to Orders</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Manage Order <span className="text-[#377771] dark:text-[#4CE0B3]">#{order.id.slice(-6)}</span></h1>
          <p className="text-slate-500 font-medium mt-1">Review items and update fulfillment status.</p>
        </div>
        <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-[20px] border border-border/50">
          <Badge variant="outline" className="text-sm px-4 py-1.5 rounded-[10px] font-bold border-border/50 bg-background uppercase tracking-wider">{order.orderStatus}</Badge>
          <Select
            value={order.orderStatus}
            onValueChange={(value) => handleUpdateStatus(value as OrderStatus)}
            disabled={isUpdating || nextStatuses.length === 0}
          >
            <SelectTrigger className="w-[180px] h-11 rounded-[12px] bg-background border-border/50 font-bold">
              <SelectValue placeholder="Update status" />
            </SelectTrigger>
            <SelectContent className="rounded-[16px] border-border/50">
              <SelectItem value={order.orderStatus} className="font-bold">{order.orderStatus}</SelectItem>
              {nextStatuses.map((status) => (
                <SelectItem key={status} value={status} className="font-bold">
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_400px] gap-8">
        <Card className="rounded-[24px] border-border/50 bg-background shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="bg-muted/30 border-b border-border/20 pb-6 pt-8 px-8">
            <CardTitle className="text-2xl font-extrabold text-foreground">Order Items</CardTitle>
            <CardDescription className="text-slate-500 font-medium text-base mt-1">Items to prepare for this order</CardDescription>
          </CardHeader>
          <CardContent className="p-8 flex-1 flex flex-col">
            <div className="space-y-4 flex-1">
              {order.orderItems?.map((item) => (
                <div key={item.id} className="flex justify-between items-center border-b border-border/20 pb-4 last:border-0 last:pb-0">
                  <div className="flex gap-4 items-center">
                    <span className="font-extrabold px-3 py-1.5 bg-muted rounded-[10px] text-sm text-foreground">
                      {item.quantity}x
                    </span>
                    <span className="font-bold text-foreground text-base">{item.meal?.title || "Meal"}</span>
                  </div>
                  <span className="font-extrabold text-lg text-foreground">${item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-8 border-t border-border/50 space-y-6">
              <div className="flex justify-between items-center text-2xl font-extrabold">
                <span className="text-foreground">Total Payout</span>
                <span className="text-[#377771] dark:text-[#4CE0B3]">${order.totalPrice.toFixed(2)}</span>
              </div>
              <div className="p-4 bg-muted/20 rounded-[16px] border border-border/50">
                <p className="text-xs font-bold uppercase text-slate-500 tracking-widest mb-1">Payment Status</p>
                <p className="font-bold text-foreground">{order.paymentMethod} • <span className={order.paymentStatus === 'PAID' ? 'text-[#377771] dark:text-[#4CE0B3]' : 'text-slate-500'}>{order.paymentStatus}</span></p>
              </div>
              
              {order.paymentMethod === PaymentMethod.COD && order.paymentStatus === PaymentStatus.COD_PENDING ? (
                <Button
                  type="button"
                  className="w-full h-12 rounded-[14px] bg-[#ED6A5E] hover:bg-[#FF8E72] text-white font-bold transition-all shadow-md hover:-translate-y-0.5"
                  onClick={handleCollectCod}
                  disabled={isCollectingCod}
                >
                  Mark COD Collected
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="rounded-[24px] border-border/50 bg-background shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/20 pb-6 pt-8 px-8">
              <CardTitle className="text-xl font-extrabold text-foreground">Customer Info</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Name</p>
                <p className="font-bold text-foreground text-lg">{order.customer?.name || "Customer"}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Contact</p>
                <p className="font-medium text-foreground">{order.customer?.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Delivery Address</p>
                <p className="font-medium text-foreground leading-relaxed whitespace-pre-wrap p-4 bg-muted/20 rounded-[16px] border border-border/50">{order.deliveryAddress}</p>
              </div>
              <div className="pt-6 border-t border-border/20">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Order Placed At</p>
                <p className="font-medium text-foreground">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="pt-4 border-t border-border/50">
        <Button asChild variant="outline" className="h-12 px-8 rounded-[14px] border-border/50 font-bold hover:bg-muted text-foreground">
          <Link href="/provider/orders">Back to Orders Directory</Link>
        </Button>
      </div>
    </div>
  );
}
