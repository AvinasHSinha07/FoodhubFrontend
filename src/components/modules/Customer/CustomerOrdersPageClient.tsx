"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { OrderServices } from "@/services/order.services";
import { IOrder, IOrderItem, OrderStatus, PaymentStatus } from "@/types/order.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ReviewModal } from "@/components/modules/Customer/ReviewModal";
import { RotateCcw, Star } from "lucide-react";
import { queryKeys } from "@/lib/query/query-keys";
import { useCart } from "@/providers/CartProvider";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PaginationControls from "@/components/shared/list/PaginationControls";
import SortControl from "@/components/shared/list/SortControl";
import { getOrderFiltersFromSearchParams } from "@/lib/query/order-filters";
import { setReorderDraftDeliveryAddress } from "@/lib/reorder-draft";

export default function CustomerOrdersPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const queryString = searchParams?.toString() || "";
  const { items, providerId, replaceCartFromOrder } = useCart();

  const [selectedOrderStatus, setSelectedOrderStatus] = useState(
    searchParams?.get("orderStatus") || "ALL"
  );
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(
    searchParams?.get("paymentStatus") || "ALL"
  );
  const [sortValue, setSortValue] = useState(
    `${searchParams?.get("sortBy") || "createdAt"}:${searchParams?.get("sortOrder") || "desc"}`
  );

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<IOrderItem | null>(null);

  useEffect(() => {
    setSelectedOrderStatus(searchParams?.get("orderStatus") || "ALL");
    setSelectedPaymentStatus(searchParams?.get("paymentStatus") || "ALL");
    setSortValue(`${searchParams?.get("sortBy") || "createdAt"}:${searchParams?.get("sortOrder") || "desc"}`);
  }, [searchParams]);

  const filters = useMemo(() => {
    return getOrderFiltersFromSearchParams(new URLSearchParams(queryString));
  }, [queryString]);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.customerOrders(queryString),
    queryFn: () => OrderServices.getCustomerOrders(filters),
    staleTime: 1000 * 60 * 3,
  });

  const orders = (data?.data || []) as IOrder[];
  const ordersMeta = data?.meta;

  const updateParams = (updates: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams?.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "ALL") {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    });

    const nextQueryString = nextParams.toString();
    router.replace(nextQueryString ? `${pathname}?${nextQueryString}` : pathname, { scroll: false });
  };

  const handleSortChange = (value: string) => {
    setSortValue(value);
    const [sortBy, sortOrder] = value.split(":");
    updateParams({ sortBy, sortOrder, page: "1" });
  };

  const handlePageChange = (nextPage: number) => {
    updateParams({ page: String(nextPage) });
  };

  const reorderMutation = useMutation({
    mutationFn: (orderId: string) => OrderServices.reorderOrder(orderId),
    onSuccess: (response) => {
      const payload = response.data;

      if (!payload) {
        toast.error("Unable to reorder this order right now.");
        return;
      }

      if (providerId && items.length > 0 && providerId !== payload.provider.id) {
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

  const handleOpenReview = (item: IOrderItem) => {
    setSelectedItem(item);
    setIsReviewOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLACED": return "bg-[#377771]/10 text-[#377771] border-[#377771]/20";
      case "PREPARING": return "bg-amber-100 text-amber-800 border-amber-200";
      case "READY": return "bg-[#ED6A5E]/10 text-[#ED6A5E] border-[#ED6A5E]/20";
      case "DELIVERED": return "bg-[#4CE0B3]/10 text-[#4CE0B3] border-[#4CE0B3]/20";
      case "CANCELLED": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground border-border/50";
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">My Orders</h1>
        <p className="text-slate-500 font-medium mt-1">View and track your previous food orders.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-muted/30 p-4 rounded-[20px] border border-border/50">
        <div className="flex flex-wrap gap-3">
          <Select
            value={selectedOrderStatus}
            onValueChange={(value) => {
              setSelectedOrderStatus(value);
              updateParams({ orderStatus: value, page: "1" });
            }}
          >
            <SelectTrigger className="w-45 bg-background border-border/50 rounded-[12px] font-medium h-11">
              <SelectValue placeholder="Order status" />
            </SelectTrigger>
            <SelectContent className="rounded-[16px] border-border/50">
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value={OrderStatus.PLACED}>Placed</SelectItem>
              <SelectItem value={OrderStatus.PREPARING}>Preparing</SelectItem>
              <SelectItem value={OrderStatus.READY}>Ready</SelectItem>
              <SelectItem value={OrderStatus.DELIVERED}>Delivered</SelectItem>
              <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedPaymentStatus}
            onValueChange={(value) => {
              setSelectedPaymentStatus(value);
              updateParams({ paymentStatus: value, page: "1" });
            }}
          >
            <SelectTrigger className="w-45 bg-background border-border/50 rounded-[12px] font-medium h-11">
              <SelectValue placeholder="Payment status" />
            </SelectTrigger>
            <SelectContent className="rounded-[16px] border-border/50">
              <SelectItem value="ALL">All Payments</SelectItem>
              <SelectItem value={PaymentStatus.PENDING}>Pending</SelectItem>
              <SelectItem value={PaymentStatus.COD_PENDING}>COD Pending</SelectItem>
              <SelectItem value={PaymentStatus.PAID}>Paid</SelectItem>
              <SelectItem value={PaymentStatus.COD_COLLECTED}>COD Collected</SelectItem>
              <SelectItem value={PaymentStatus.FAILED}>Failed</SelectItem>
              <SelectItem value={PaymentStatus.REFUNDED}>Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <SortControl
          value={sortValue}
          onValueChange={handleSortChange}
          options={[
            { label: "Newest", value: "createdAt:desc" },
            { label: "Oldest", value: "createdAt:asc" },
            { label: "Total: High to Low", value: "totalPrice:desc" },
            { label: "Total: Low to High", value: "totalPrice:asc" },
          ]}
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-[24px]" />
          <Skeleton className="h-40 w-full rounded-[24px]" />
          <Skeleton className="h-40 w-full rounded-[24px]" />
        </div>
      ) : orders.length === 0 ? (
        <Card className="text-center py-24 bg-background border-border/50 rounded-[24px] shadow-sm">
          <RotateCcw className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-foreground">No Orders Found</h2>
          <p className="text-slate-500 mt-2 font-medium">You haven't placed any orders yet.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="rounded-[24px] border-border/50 shadow-sm hover:shadow-md transition-all duration-300 bg-background overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/20 bg-muted/30 pb-4 pt-5 px-6">
                <div>
                  <CardTitle className="text-lg font-extrabold text-foreground">
                    {order.provider?.restaurantName || "Restaurant"}
                  </CardTitle>
                  <CardDescription className="text-xs font-bold text-slate-500 pt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={`${getStatusColor(order.orderStatus)} border-none font-bold uppercase tracking-wider text-[10px]`}>
                    {order.orderStatus}
                  </Badge>
                  <p className="text-[10px] text-slate-500 mt-1.5 uppercase font-bold tracking-wider">
                    {order.paymentMethod} • <span className={order.paymentStatus === 'PAID' ? 'text-[#4CE0B3]' : 'text-slate-500'}>{order.paymentStatus}</span>
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pt-6 px-6">
                <div className="space-y-4">
                  {order.orderItems?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm border-b border-border/30 pb-3 last:border-0 last:pb-0 group">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex gap-4 items-center">
                          <span className="font-bold px-2.5 py-1 bg-muted rounded-[8px] text-xs text-foreground">
                            {item.quantity}x
                          </span>
                          <span className="font-bold text-foreground">{item.meal?.title || "Unknown Meal"}</span>
                        </div>
                        {order.orderStatus === "DELIVERED" && !item.review && (
                          <div className="pl-14">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-[11px] font-bold text-[#ED6A5E] hover:text-white hover:bg-[#ED6A5E] px-3 rounded-[8px] transition-all"
                              onClick={() => handleOpenReview(item)}
                            >
                              <Star className="w-3 h-3 mr-1.5" /> Leave Review
                            </Button>
                          </div>
                        )}
                      </div>
                      <span className="font-extrabold text-[#377771] dark:text-[#4CE0B3] self-start mt-1">${item.totalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-center pt-4 border-t border-border/50 mt-4">
                    <span className="font-extrabold text-foreground">Total Paid</span>
                    <span className="text-xl font-extrabold text-[#377771] dark:text-[#4CE0B3]">${order.totalPrice.toFixed(2)}</span>
                  </div>

                  <p className="text-[11px] font-medium text-slate-500 bg-muted/50 p-2.5 rounded-[12px] mt-2 mb-4">
                    <span className="font-bold text-foreground">Delivery to:</span> {order.deliveryAddress}
                  </p>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2">
                    <Button asChild variant="outline" className="w-full h-11 rounded-[12px] border-border/50 hover:bg-muted font-bold text-foreground">
                      <Link href={`/customer/orders/${order.id}`}>View Details</Link>
                    </Button>
                    <Button
                      className="w-full h-11 rounded-[12px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-[#377771] dark:hover:bg-[#4CE0B3] dark:hover:text-emerald-950 font-bold transition-all shadow-sm"
                      onClick={() => reorderMutation.mutate(order.id)}
                      disabled={reorderMutation.isPending}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      {reorderMutation.isPending ? "Reordering..." : "Order Again"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <PaginationControls meta={ordersMeta} onPageChange={handlePageChange} isLoading={isLoading} />
        </div>
      )}

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        orderItem={selectedItem}
      />
    </div>
  );
}
