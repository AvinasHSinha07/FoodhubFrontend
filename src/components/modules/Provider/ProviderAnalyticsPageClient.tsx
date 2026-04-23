"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AnalyticsServices } from "@/services/analytics.services";
import { queryKeys } from "@/lib/query/query-keys";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const PIE_COLORS = ["#f59e0b", "#3b82f6", "#22c55e", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function ProviderAnalyticsPageClient() {
  const [days, setDays] = useState(30);

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.providerAnalytics(days),
    queryFn: () => AnalyticsServices.getProviderAnalyticsOverview(days),
    staleTime: 1000 * 60 * 2,
  });

  const analytics = data?.data;

  if (isLoading || !analytics) {
    if (error) {
      return (
        <Card className="m-6">
          <CardHeader>
            <CardTitle>Analytics unavailable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-500">
              Create your provider profile and receive some orders to unlock analytics.
            </p>
            <Button asChild>
              <Link href="/provider/profile">Go to Profile Setup</Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Restaurant Analytics</h1>
          <p className="text-sm text-gray-500">Operational and revenue insights for {analytics.provider.restaurantName}.</p>
        </div>
        <Select value={String(days)} onValueChange={(value) => setDays(Number(value))}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.summary.totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Net Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${analytics.summary.providerNetPayout.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Gross Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${analytics.summary.providerGrossEarning.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Paid Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.summary.paidOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.summary.pendingPayments}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Orders and Net Payout</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.ordersByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#3b82f6" />
                <Bar dataKey="revenue" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.paymentStatusBreakdown}
                  dataKey="count"
                  nameKey="paymentStatus"
                  outerRadius={100}
                  label
                >
                  {analytics.paymentStatusBreakdown.map((entry, index) => (
                    <Cell key={`${entry.paymentStatus}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Meals by Revenue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {analytics.topMeals.length === 0 ? (
            <p className="text-sm text-gray-500">No meal sales in this period.</p>
          ) : (
            analytics.topMeals.map((meal, index) => (
              <div key={meal.mealId} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="font-semibold">#{index + 1} {meal.title}</p>
                  <p className="text-xs text-gray-500">Sold: {meal.quantity} items</p>
                </div>
                <p className="font-semibold">${meal.revenue.toFixed(2)}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
