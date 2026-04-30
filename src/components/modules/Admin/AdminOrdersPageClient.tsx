"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AdminServices } from "@/services/admin.services";
import { IOrder, OrderStatus, PaymentStatus } from "@/types/order.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingBag, ArrowRight, UserCheck, Store } from "lucide-react";
import { queryKeys } from "@/lib/query/query-keys";
import PaginationControls from "@/components/shared/list/PaginationControls";
import SortControl from "@/components/shared/list/SortControl";
import { getOrderFiltersFromSearchParams } from "@/lib/query/order-filters";

export default function AdminOrdersPageClient() {
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

  useEffect(() => {
    setSelectedOrderStatus(searchParams?.get("orderStatus") || "ALL");
    setSelectedPaymentStatus(searchParams?.get("paymentStatus") || "ALL");
    setSortValue(`${searchParams?.get("sortBy") || "createdAt"}:${searchParams?.get("sortOrder") || "desc"}`);
  }, [searchParams]);

  const filters = useMemo(() => {
    return getOrderFiltersFromSearchParams(new URLSearchParams(queryString));
  }, [queryString]);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.adminOrders(queryString),
    queryFn: () => AdminServices.getAllOrders(filters),
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLACED": return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700";
      case "PREPARING": return "bg-[#377771]/10 text-[#377771] border-[#377771]/20 dark:bg-[#4CE0B3]/10 dark:text-[#4CE0B3] dark:border-[#4CE0B3]/20";
      case "READY": return "bg-[#ED6A5E]/10 text-[#ED6A5E] border-[#ED6A5E]/20";
      case "DELIVERED": return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
      case "CANCELLED": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-slate-500 border-border/50";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Order Monitoring</h1>
          <p className="text-slate-500 font-medium mt-1">Monitor all platform food orders globally.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-4">
          <Select
            value={selectedOrderStatus}
            onValueChange={(value) => {
              setSelectedOrderStatus(value);
              updateParams({ orderStatus: value, page: "1" });
            }}
          >
            <SelectTrigger className="w-[180px] h-12 rounded-[14px] bg-background border-border/50 font-bold focus:ring-[#377771] dark:focus:ring-[#4CE0B3]">
              <SelectValue placeholder="Order status" />
            </SelectTrigger>
            <SelectContent className="rounded-[16px] border-border/50">
              <SelectItem value="ALL" className="font-bold">All Orders</SelectItem>
              <SelectItem value={OrderStatus.PLACED} className="font-bold">Placed</SelectItem>
              <SelectItem value={OrderStatus.PREPARING} className="font-bold">Preparing</SelectItem>
              <SelectItem value={OrderStatus.READY} className="font-bold">Ready</SelectItem>
              <SelectItem value={OrderStatus.DELIVERED} className="font-bold">Delivered</SelectItem>
              <SelectItem value={OrderStatus.CANCELLED} className="font-bold">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedPaymentStatus}
            onValueChange={(value) => {
              setSelectedPaymentStatus(value);
              updateParams({ paymentStatus: value, page: "1" });
            }}
          >
            <SelectTrigger className="w-[180px] h-12 rounded-[14px] bg-background border-border/50 font-bold focus:ring-[#377771] dark:focus:ring-[#4CE0B3]">
              <SelectValue placeholder="Payment status" />
            </SelectTrigger>
            <SelectContent className="rounded-[16px] border-border/50">
              <SelectItem value="ALL" className="font-bold">All Payments</SelectItem>
              <SelectItem value={PaymentStatus.PENDING} className="font-bold">Pending</SelectItem>
              <SelectItem value={PaymentStatus.COD_PENDING} className="font-bold">COD Pending</SelectItem>
              <SelectItem value={PaymentStatus.PAID} className="font-bold">Paid</SelectItem>
              <SelectItem value={PaymentStatus.COD_COLLECTED} className="font-bold">COD Collected</SelectItem>
              <SelectItem value={PaymentStatus.FAILED} className="font-bold">Failed</SelectItem>
              <SelectItem value={PaymentStatus.REFUNDED} className="font-bold">Refunded</SelectItem>
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
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-[24px]" />
          <Skeleton className="h-48 w-full rounded-[24px]" />
          <Skeleton className="h-48 w-full rounded-[24px]" />
        </div>
      ) : orders.length === 0 ? (
        <Card className="text-center py-24 bg-background border-border/50 rounded-[24px] shadow-sm">
          <div className="mx-auto h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground">No Orders Found</h2>
          <p className="text-slate-500 font-medium mt-2">Adjust your filters or wait for new orders to arrive.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="rounded-[24px] border-border/50 bg-background shadow-sm hover:shadow-md transition-all overflow-hidden group">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-border/20 bg-muted/20 px-8 pt-8 gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <CardTitle className="text-xl font-extrabold text-foreground tracking-tight">#{order.id.slice(0, 8)}</CardTitle>
                    <Badge variant="outline" className={`font-bold px-3 py-1 rounded-[8px] tracking-wide ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </Badge>
                    <Badge variant="secondary" className="uppercase text-[10px] font-bold tracking-widest px-2 py-1 rounded-[6px] bg-background border border-border/50">
                      {order.paymentMethod} / {order.paymentStatus}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm font-medium text-slate-500 mt-2">
                    {new Date(order.createdAt).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-3xl font-extrabold text-[#377771] dark:text-[#4CE0B3]">${order.totalPrice.toFixed(2)}</p>
                  <p className="text-sm font-medium text-slate-500 mt-1">{order.orderItems?.length || 0} items</p>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row items-stretch justify-between gap-8">
                  <div className="w-full lg:w-[45%] bg-muted/30 border border-border/50 p-5 rounded-[16px] flex items-start gap-4">
                    <div className="p-3 bg-background rounded-[12px] border border-border/50 text-[#377771] dark:text-[#4CE0B3] shrink-0">
                      <UserCheck className="h-5 w-5" />
                    </div>
                    <div className="overflow-hidden w-full">
                      <p className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Customer Details</p>
                      <p className="font-bold text-foreground text-base truncate">{order.customer?.name || "Unknown"}</p>
                      <p className="text-sm font-medium text-slate-500 truncate mt-0.5">{order.customer?.email}</p>
                      <p className="text-sm font-medium text-foreground mt-3 line-clamp-2 bg-background border border-border/50 p-2.5 rounded-[10px]">{order.deliveryAddress}</p>
                    </div>
                  </div>

                  <div className="hidden lg:flex items-center justify-center">
                    <ArrowRight className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                  </div>

                  <div className="w-full lg:w-[45%] bg-muted/30 border border-border/50 p-5 rounded-[16px] flex items-start gap-4">
                    <div className="p-3 bg-background rounded-[12px] border border-border/50 text-[#ED6A5E] shrink-0">
                      <Store className="h-5 w-5" />
                    </div>
                    <div className="overflow-hidden w-full">
                      <p className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Provider & Items</p>
                      <p className="font-bold text-foreground text-base truncate">{order.provider?.restaurantName || "Unknown"}</p>
                      <ul className="text-sm font-medium text-foreground mt-3 divide-y divide-border/20 border-t border-border/50 pt-2 space-y-2 w-full">
                        {order.orderItems?.slice(0, 2).map((item, idx) => (
                          <li key={idx} className="flex justify-between items-center py-1">
                            <span className="truncate pr-2"><span className="text-slate-500 mr-2">{item.quantity}x</span> {item.meal?.title}</span>
                            <span className="shrink-0 text-slate-500 font-bold">${item.unitPrice.toFixed(2)}</span>
                          </li>
                        ))}
                        {(order.orderItems?.length || 0) > 2 && (
                          <li className="text-slate-400 italic py-1 text-xs">+ {(order.orderItems?.length || 0) - 2} more items</li>
                        )}
                      </ul>
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
