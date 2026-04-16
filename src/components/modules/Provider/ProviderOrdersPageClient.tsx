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
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update status");
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
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to collect COD payment.");
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
            { label: "Updated: Newest", value: "updatedAt:desc" },
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
      ) : isProviderProfileMissing ? (
        <Card className="text-center py-20 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-700">Complete Your Provider Profile</h2>
          <p className="text-gray-500 mt-2">Create your profile first to start receiving orders.</p>
          <Button asChild className="mt-6">
            <Link href="/provider/profile">Set Up Profile</Link>
          </Button>
        </Card>
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
                      Payment: {order.paymentMethod} / {order.paymentStatus}
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
                    {order.paymentMethod === PaymentMethod.COD && order.paymentStatus === PaymentStatus.COD_PENDING ? (
                      <Button
                        type="button"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => handleCollectCod(order.id)}
                        disabled={isCollectingCod}
                      >
                        Mark COD Collected
                      </Button>
                    ) : null}
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
          <PaginationControls meta={ordersMeta} onPageChange={handlePageChange} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}
