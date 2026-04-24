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
      case "PLACED": return "bg-blue-100 text-blue-800";
      case "PREPARING": return "bg-yellow-100 text-yellow-800";
      case "READY": return "bg-orange-100 text-orange-800";
      case "DELIVERED": return "bg-green-100 text-green-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
        <p className="text-gray-500">View and track your previous food orders.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <Select
            value={selectedOrderStatus}
            onValueChange={(value) => {
              setSelectedOrderStatus(value);
              updateParams({ orderStatus: value, page: "1" });
            }}
          >
            <SelectTrigger className="w-45 bg-white">
              <SelectValue placeholder="Order status" />
            </SelectTrigger>
            <SelectContent>
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
            <SelectTrigger className="w-45 bg-white">
              <SelectValue placeholder="Payment status" />
            </SelectTrigger>
            <SelectContent>
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
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : orders.length === 0 ? (
        <Card className="text-center py-20 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-700">No Orders Found</h2>
          <p className="text-gray-500 mt-2">You haven't placed any orders yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gray-50/50">
                <div>
                  <CardTitle className="text-lg">
                    Order from {order.provider?.restaurantName || "Restaurant"}
                  </CardTitle>
                  <CardDescription className="text-xs pt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={getStatusColor(order.orderStatus)}>
                    {order.orderStatus}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1 uppercase font-medium">
                    {order.paymentMethod} / {order.paymentStatus}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {order.orderItems?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-3 items-center">
                          <span className="font-medium px-2 py-0.5 bg-gray-100 rounded text-xs">
                            {item.quantity}x
                          </span>
                          <span className="font-medium">{item.meal?.title || "Unknown Meal"}</span>
                        </div>
                        {order.orderStatus === "DELIVERED" && !item.review && (
                          <div className="pl-12">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-2"
                              onClick={() => handleOpenReview(item)}
                            >
                              <Star className="w-3 h-3 mr-1" /> Leave Review
                            </Button>
                          </div>
                        )}
                      </div>
                      <span className="text-gray-600 self-start">${item.totalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center font-semibold pt-1">
                    <span>Total Paid</span>
                    <span>${order.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/customer/orders/${order.id}`}>View Order Details</Link>
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => reorderMutation.mutate(order.id)}
                      disabled={reorderMutation.isPending}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      {reorderMutation.isPending ? "Reordering..." : "Reorder"}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-dashed">
                    <span className="font-medium">Delivery to:</span> {order.deliveryAddress}
                  </p>
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
