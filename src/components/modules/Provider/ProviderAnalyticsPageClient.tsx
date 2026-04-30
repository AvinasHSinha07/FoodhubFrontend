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

const PIE_COLORS = ["#377771", "#4CE0B3", "#ED6A5E", "#FF8E72", "#1E293B", "#94A3B8"];

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
        <div className="p-6 max-w-7xl mx-auto">
          <Card className="rounded-[24px] border-border/50 bg-background text-center py-20">
            <CardHeader>
              <CardTitle className="text-2xl font-extrabold text-foreground">Analytics Unavailable</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-slate-500 font-medium max-w-md mx-auto">
                Create your provider profile and receive some orders to unlock analytics and business insights.
              </p>
              <Button asChild className="h-12 px-8 rounded-[14px] bg-[#377771] hover:bg-[#4CE0B3] text-white hover:text-emerald-950 font-bold transition-all shadow-md hover:-translate-y-0.5">
                <Link href="/provider/profile">Go to Profile Setup</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-32 w-full rounded-[24px]" />
        <Skeleton className="h-[400px] w-full rounded-[24px]" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Restaurant Analytics</h1>
          <p className="text-slate-500 font-medium mt-1">Operational and revenue insights for <span className="font-bold text-foreground">{analytics.provider.restaurantName}</span>.</p>
        </div>
        <Select value={String(days)} onValueChange={(value) => setDays(Number(value))}>
          <SelectTrigger className="w-[180px] h-12 rounded-[14px] bg-background border-border/50 font-bold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-[16px] border-border/50">
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="rounded-[20px] border-border/50 bg-background shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-foreground">{analytics.summary.totalOrders}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[20px] border-border/50 bg-background shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-[#377771] dark:text-[#4CE0B3]">${analytics.summary.providerNetPayout.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[20px] border-border/50 bg-background shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-foreground">${analytics.summary.providerGrossEarning.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[20px] border-border/50 bg-background shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Paid Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-foreground">{analytics.summary.paidOrders}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[20px] border-border/50 bg-background shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-[#ED6A5E]">{analytics.summary.pendingPayments}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card className="rounded-[24px] border-border/50 bg-background shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-extrabold text-foreground">Daily Orders & Payout</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.ordersByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis yAxisId="left" orientation="left" stroke="#377771" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                <YAxis yAxisId="right" orientation="right" stroke="#ED6A5E" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={10} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar yAxisId="left" dataKey="orders" fill="#377771" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="revenue" fill="#ED6A5E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-border/50 bg-background shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-extrabold text-foreground">Payment Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.paymentStatusBreakdown}
                  dataKey="count"
                  nameKey="paymentStatus"
                  outerRadius={110}
                  innerRadius={70}
                  stroke="none"
                  paddingAngle={5}
                >
                  {analytics.paymentStatusBreakdown.map((entry, index) => (
                    <Cell key={`${entry.paymentStatus}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[24px] border-border/50 bg-background shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-extrabold text-foreground">Top Meals by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topMeals.length === 0 ? (
              <div className="text-center py-10 bg-muted/20 rounded-[16px] border border-border/50">
                <p className="text-slate-500 font-medium">No meal sales in this period.</p>
              </div>
            ) : (
              analytics.topMeals.map((meal, index) => (
                <div key={meal.mealId} className="flex items-center justify-between rounded-[16px] border border-border/50 bg-muted/20 p-4 hover:border-border transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center font-extrabold text-foreground shadow-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-extrabold text-foreground">{meal.title}</p>
                      <p className="text-xs font-bold text-slate-500">Sold: <span className="text-foreground">{meal.quantity} items</span></p>
                    </div>
                  </div>
                  <p className="font-extrabold text-xl text-[#377771] dark:text-[#4CE0B3]">${meal.revenue.toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
