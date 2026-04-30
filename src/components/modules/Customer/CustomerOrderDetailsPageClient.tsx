"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { OrderServices } from "@/services/order.services";
import { IOrder } from "@/types/order.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/CartProvider";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query/query-keys";
import { setReorderDraftDeliveryAddress } from "@/lib/reorder-draft";

type CustomerOrderDetailsPageClientProps = {
  orderId: string;
};

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

export default function CustomerOrderDetailsPageClient({ orderId }: CustomerOrderDetailsPageClientProps) {
  const router = useRouter();
  const { items, providerId: cartProviderId, replaceCartFromOrder } = useCart();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.order(orderId),
    queryFn: () => OrderServices.getOrderById(orderId),
    staleTime: 1000 * 60 * 3,
  });

  const reorderMutation = useMutation({
    mutationFn: () => OrderServices.reorderOrder(orderId),
    onSuccess: (response) => {
      const payload = response.data;

      if (!payload) {
        toast.error("Unable to reorder this order right now.");
        return;
      }

      if (cartProviderId && items.length > 0 && cartProviderId !== payload.provider.id) {
        const confirmed = window.confirm(
          "Your cart has items from another restaurant. Replace cart and continue to checkout?"
        );

        if (!confirmed) {
          return;
        }
      }

      replaceCartFromOrder({
        provider: payload.provider,
        items: payload.items.map((item) => ({ meal: item.meal, quantity: item.quantity })),
      });

      setReorderDraftDeliveryAddress(payload.deliveryAddress || "");

      toast.success("Reorder items added to cart.");
      router.push("/checkout");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to reorder this order.");
    },
  });

  const order = (data?.data || null) as IOrder | null;

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <Skeleton className="h-[400px] w-full rounded-[24px]" />
           <Skeleton className="h-[400px] w-full rounded-[24px]" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="text-center py-24 bg-background border-border/50 rounded-[24px] shadow-sm">
          <h2 className="text-2xl font-extrabold text-foreground">Order Not Found</h2>
          <p className="text-slate-500 font-medium mt-2">The order you are looking for may not exist or you don't have permission to view it.</p>
          <Button asChild className="mt-8 h-12 px-8 rounded-[14px] bg-[#377771] hover:bg-[#4CE0B3] text-white hover:text-emerald-950 font-bold transition-all shadow-md hover:-translate-y-0.5">
            <Link href="/customer/orders">Back to My Orders</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLACED": return "bg-[#377771]/10 text-[#377771] border-[#377771]/20";
      case "PREPARING": return "bg-amber-100 text-amber-800 border-amber-200";
      case "READY": return "bg-[#ED6A5E]/10 text-[#ED6A5E] border-[#ED6A5E]/20";
      case "DELIVERED": return "bg-[#4CE0B3]/10 text-[#4CE0B3] border-[#4CE0B3]/20";
      case "CANCELLED": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-slate-500 border-border/50";
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Order #{order.id.slice(-6).toUpperCase()}</h1>
            <Badge variant="outline" className={`${getStatusColor(order.orderStatus)} border font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-[8px]`}>
              {order.orderStatus}
            </Badge>
          </div>
          <p className="text-slate-500 font-medium">Placed on {new Date(order.createdAt).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline" className="h-12 px-6 rounded-[14px] border-border/50 font-bold hover:bg-muted">
            <Link href="/customer/orders">Back to List</Link>
          </Button>
          <Button
            className="h-12 px-8 rounded-[14px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-[#ED6A5E] dark:hover:bg-[#ED6A5E] dark:hover:text-white font-bold transition-all shadow-md hover:-translate-y-0.5"
            onClick={() => reorderMutation.mutate()}
            disabled={reorderMutation.isPending}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {reorderMutation.isPending ? "Reordering..." : "Reorder"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_350px] gap-8">
        <div className="space-y-8">
          <Card className="rounded-[24px] border-border/50 shadow-sm bg-background overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/20 pb-6 pt-8 px-8">
              <CardTitle className="text-2xl font-extrabold text-foreground">Order Items</CardTitle>
              <CardDescription className="text-slate-500 font-medium">Items ordered from {order.provider?.restaurantName || "Restaurant"}</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                {order.orderItems?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center group">
                    <div className="flex gap-4 items-center">
                      <div className="w-14 h-14 rounded-[16px] bg-muted flex items-center justify-center font-extrabold text-slate-500 border border-border/50 shadow-sm relative overflow-hidden">
                         {item.meal?.image ? (
                           <img src={item.meal.image} alt={item.meal.title} className="w-full h-full object-cover" />
                         ) : (
                           <span className="text-lg">{item.quantity}x</span>
                         )}
                         {item.meal?.image && (
                           <div className="absolute top-0 right-0 bg-[#ED6A5E] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-[8px] shadow-sm">
                             {item.quantity}x
                           </div>
                         )}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-lg group-hover:text-[#ED6A5E] transition-colors">{item.meal?.title || "Unknown Meal"}</p>
                        <p className="text-sm font-medium text-slate-500">${item.meal?.price?.toFixed(2)} per unit</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-[#377771] dark:text-[#4CE0B3] text-lg">${item.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 pt-8 border-t border-border/50 space-y-4">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Subtotal</span>
                  <span className="font-bold text-foreground">${order.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-[#4CE0B3]">Free</span>
                </div>
                <div className="flex justify-between items-center pt-4 mt-2">
                  <span className="text-xl font-extrabold text-foreground">Grand Total</span>
                  <span className="text-3xl font-extrabold text-[#377771] dark:text-[#4CE0B3]">${order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-border/50 shadow-sm bg-background overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/20 pb-6 pt-8 px-8">
              <CardTitle className="text-2xl font-extrabold text-foreground">Delivery & Tracking</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-[16px] bg-[#ED6A5E]/10 flex items-center justify-center shrink-0">
                  <div className="w-5 h-5 bg-[#ED6A5E] rounded-full shadow-[0_0_10px_rgba(237,106,94,0.5)] animate-pulse"></div>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-foreground mb-1">Delivery Address</h4>
                  <p className="text-slate-500 font-medium leading-relaxed">{order.deliveryAddress}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border/20">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Payment Method</h4>
                  <Badge variant="outline" className="font-bold uppercase tracking-wider text-[10px] bg-muted/50 border-border/50 py-1.5 px-3 rounded-[8px]">
                    {order.paymentMethod.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Payment Status</h4>
                  <Badge variant="outline" className={`font-bold uppercase tracking-wider text-[10px] border-none py-1.5 px-3 rounded-[8px] ${order.paymentStatus === 'PAID' ? 'bg-[#4CE0B3]/10 text-[#377771] dark:text-[#4CE0B3]' : 'bg-amber-100 text-amber-800'}`}>
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[24px] border-border/50 shadow-sm bg-background overflow-hidden sticky top-28">
            <CardHeader className="bg-muted/30 border-b border-border/20 pb-6 pt-8 px-8">
              <CardTitle className="text-xl font-extrabold text-foreground">Support</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="p-6 rounded-[20px] bg-muted/20 border border-border/50 text-center">
                 <p className="text-sm font-medium text-slate-500 mb-4">Need help with this order?</p>
                 <Button variant="outline" className="w-full h-11 rounded-[12px] border-border/50 font-bold hover:bg-white transition-all">
                    Contact Support
                 </Button>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 text-center">Restaurant Contact</h4>
                <div className="text-center">
                  <p className="font-bold text-lg text-foreground">{order.provider?.restaurantName}</p>
                  <p className="text-sm text-slate-500 font-medium mt-1">{order.provider?.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
