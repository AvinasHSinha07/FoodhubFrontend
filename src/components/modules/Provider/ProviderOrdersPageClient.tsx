"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OrderServices } from "@/services/order.services";
import { IOrder, OrderStatus, PaymentMethod, PaymentStatus } from "@/types/order.types";
import { PaymentServices } from "@/services/payment.services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/lib/query/query-keys";
import PaginationControls from "@/components/shared/list/PaginationControls";
import SortControl from "@/components/shared/list/SortControl";
import { getOrderFiltersFromSearchParams } from "@/lib/query/order-filters";
import { getApiErrorMessage } from "@/lib/api-error";

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

export default function ProviderOrdersPageClient() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const queryString = searchParams?.toString() || "";

  const [selectedOrderStatus, setSelectedOrderStatus] = useState(
    searchParams?.get("orderStatus") || "ALL"
  );
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(
    searchParams?.get("paymentStatus") || "ALL"
  );
  const [sortValue, setSortValue] = useState(
    `${searchParams?.get("sortBy") || "createdAt"}:${searchParams?.get("sortOrder") || "desc"}`
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedOrderStatus(searchParams?.get("orderStatus") || "ALL");
    setSelectedPaymentStatus(searchParams?.get("paymentStatus") || "ALL");
    setSortValue(`${searchParams?.get("sortBy") || "createdAt"}:${searchParams?.get("sortOrder") || "desc"}`);
  }, [searchParams]);

  const filters = useMemo(() => {
    return getOrderFiltersFromSearchParams(new URLSearchParams(queryString));
  }, [queryString]);

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.providerOrders(queryString),
    queryFn: () => OrderServices.getProviderOrders(filters),
    staleTime: 1000 * 60 * 2,
  });

  const orders = (data?.data || []) as IOrder[];
  const ordersMeta = data?.meta;
  const isProviderProfileMissing = (error as any)?.response?.status === 404;

  const { mutateAsync: updateStatus } = useMutation({
    mutationFn: ({ orderId, newStatus }: { orderId: string; newStatus: string }) =>
      OrderServices.updateOrderStatus(orderId, newStatus),
  });

  const { mutateAsync: collectCodPayment, isPending: isCollectingCod } = useMutation({
    mutationFn: (orderId: string) => PaymentServices.collectCodPayment(orderId),
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateStatus({ orderId, newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      await queryClient.invalidateQueries({ queryKey: ["provider-orders"] });
    } catch (mutationError: unknown) {
      toast.error(getApiErrorMessage(mutationError, "Failed to update status"));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCollectCod = async (orderId: string) => {
    try {
      await collectCodPayment(orderId);
      toast.success("COD payment marked as collected.");
      await queryClient.invalidateQueries({ queryKey: ["provider-orders"] });
      await queryClient.invalidateQueries({ queryKey: queryKeys.order(orderId) });
    } catch (mutationError: unknown) {
      toast.error(getApiErrorMessage(mutationError, "Failed to collect COD payment."));
    }
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLACED": return "bg-[#377771]/10 dark:bg-[#4CE0B3]/10 text-[#377771] dark:text-[#4CE0B3] border-[#377771]/20 dark:border-[#4CE0B3]/20";
      case "PREPARING": return "bg-amber-100 text-amber-800 border-amber-200";
      case "READY": return "bg-[#ED6A5E]/10 text-[#ED6A5E] border-[#ED6A5E]/20";
      case "DELIVERED": return "bg-[#4CE0B3]/10 text-[#4CE0B3] border-[#4CE0B3]/20";
      case "CANCELLED": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground border-border/50";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Manage Orders</h1>
        <p className="text-slate-500 font-medium mt-1">View and update incoming customer orders.</p>
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
            { label: "Updated: Newest", value: "updatedAt:desc" },
            { label: "Total: High to Low", value: "totalPrice:desc" },
            { label: "Total: Low to High", value: "totalPrice:asc" },
          ]}
        />
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-[24px]" />
          <Skeleton className="h-40 w-full rounded-[24px]" />
          <Skeleton className="h-40 w-full rounded-[24px]" />
        </div>
      ) : isProviderProfileMissing ? (
        <Card className="text-center py-24 bg-background border-border/50 rounded-[24px] shadow-sm">
          <h2 className="text-2xl font-extrabold text-foreground">Complete Your Provider Profile</h2>
          <p className="text-slate-500 font-medium mt-2">Create your profile first to start receiving orders.</p>
          <Button asChild className="mt-8 h-12 px-8 rounded-[14px] bg-[#377771] dark:bg-[#4CE0B3] hover:bg-[#4CE0B3] dark:hover:bg-[#377771] text-white dark:text-emerald-950 dark:hover:text-white font-bold transition-all shadow-md hover:-translate-y-0.5">
            <Link href="/provider/profile">Set Up Profile</Link>
          </Button>
        </Card>
      ) : error ? (
        <Card className="text-center py-24 bg-background border-border/50 rounded-[24px] shadow-sm">
          <h2 className="text-2xl font-extrabold text-destructive">Unable to load orders</h2>
          <p className="text-slate-500 font-medium mt-2">{getApiErrorMessage(error, "Please refresh and try again.")}</p>
        </Card>
      ) : orders.length === 0 ? (
        <Card className="text-center py-24 bg-background border-border/50 rounded-[24px] shadow-sm">
          <h2 className="text-2xl font-extrabold text-foreground">No Orders Yet</h2>
          <p className="text-slate-500 font-medium mt-2">When customers place orders, they will appear here.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="rounded-[24px] border-border/50 shadow-sm hover:shadow-md transition-all duration-300 bg-background overflow-hidden">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border/20 bg-muted/30 pb-4 pt-5 px-6 gap-4">
                <div>
                  <CardTitle className="text-lg font-extrabold text-foreground">
                    Order #{order.id.slice(0, 8)}
                  </CardTitle>
                  <CardDescription className="text-xs font-bold text-slate-500 pt-1">
                    Placed: {new Date(order.createdAt).toLocaleString()}
                    <br />
                    Customer: <span className="text-foreground">{order.customer?.name || "Unknown"}</span> ({order.customer?.email})
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 mt-1.5 uppercase font-bold tracking-wider mb-1">
                      Payment: {order.paymentMethod} • <span className={order.paymentStatus === 'PAID' ? 'text-[#4CE0B3]' : 'text-slate-500'}>{order.paymentStatus}</span>
                    </p>
                  </div>
                  <Select
                    defaultValue={order.orderStatus}
                    onValueChange={(val) => handleStatusChange(order.id, val)}
                    disabled={updatingId === order.id || getAllowedTransitions(order.orderStatus).length === 0}
                  >
                    <SelectTrigger className={`w-35 font-medium border ${getStatusColor(order.orderStatus)}`}>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-[16px] border-border/50">
                      <SelectItem value={order.orderStatus}>{order.orderStatus}</SelectItem>
                      {getAllowedTransitions(order.orderStatus).map((nextStatus) => (
                        <SelectItem key={nextStatus} value={nextStatus} className="font-medium cursor-pointer">
                          {nextStatus}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="pt-6 px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-extrabold text-foreground border-b border-border/50 pb-3">Order Items</h4>
                    {order.orderItems?.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm border-b border-border/20 pb-2 last:border-0 last:pb-0">
                        <div className="flex gap-4 items-center">
                          <span className="font-bold px-2.5 py-1 bg-muted rounded-[8px] text-xs text-foreground">
                            {item.quantity}x
                          </span>
                          <span className="font-bold text-foreground">{item.meal?.title || "Unknown Meal"}</span>
                        </div>
                        <span className="font-extrabold text-[#377771] dark:text-[#4CE0B3]">${item.unitPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col space-y-4 bg-muted/20 p-5 rounded-[16px] border border-border/50">
                    <div>
                       <h4 className="text-sm font-extrabold text-foreground border-b border-border/50 pb-3 mb-3">Delivery Info</h4>
                       <p className="text-[13px] font-medium text-slate-500 whitespace-pre-wrap">{order.deliveryAddress}</p>
                    </div>
                    {order.paymentMethod === PaymentMethod.COD && order.paymentStatus === PaymentStatus.COD_PENDING ? (
                      <Button
                        type="button"
                        className="mt-2 w-full h-11 rounded-[12px] bg-[#ED6A5E] hover:bg-[#FF8E72] text-white font-bold transition-all shadow-sm"
                        onClick={() => handleCollectCod(order.id)}
                        disabled={isCollectingCod}
                      >
                        Mark COD Collected
                      </Button>
                    ) : null}
                    <div className="pt-4 mt-auto border-t border-border/50">
                      <div className="flex justify-between items-center font-extrabold">
                        <span className="text-foreground">Total Paid</span>
                        <span className="text-xl text-[#377771] dark:text-[#4CE0B3]">${order.totalPrice.toFixed(2)}</span>
                      </div>
                      <Button asChild variant="outline" className="w-full mt-4 h-11 rounded-[12px] border-border/50 hover:bg-muted font-bold text-foreground">
                        <Link href={`/provider/orders/${order.id}`}>View Full Details</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <PaginationControls meta={ordersMeta} onPageChange={handlePageChange} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}
