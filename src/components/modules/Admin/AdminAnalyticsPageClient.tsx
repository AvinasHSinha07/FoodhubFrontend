"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
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
import { AdminServices } from "@/services/admin.services";
import { queryKeys } from "@/lib/query/query-keys";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const PIE_COLORS = ["#377771", "#4CE0B3", "#ED6A5E", "#FF8E72", "#1E293B", "#94A3B8"];

export default function AdminAnalyticsPageClient() {
  const [days, setDays] = useState(30);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: queryKeys.adminAnalytics(days),
    queryFn: () => AdminServices.getAdminAnalyticsOverview(days),
    staleTime: 1000 * 20,
    refetchInterval: 1000 * 20,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: "always",
  });

  const analytics = data?.data;

  if (isLoading || !analytics) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Platform Analytics</h1>
          <p className="text-slate-500 font-medium mt-1">Revenue, payments, and order trends across FoodHub.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => refetch()} 
            disabled={isFetching}
            className="h-12 px-6 rounded-[14px] border-border/50 font-bold hover:bg-muted text-foreground transition-all"
          >
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
          <Select value={String(days)} onValueChange={(value) => setDays(Number(value))}>
            <SelectTrigger className="w-[180px] h-12 rounded-[14px] bg-background border-border/50 font-bold focus:ring-[#377771] dark:focus:ring-[#4CE0B3]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-[16px] border-border/50">
              <SelectItem value="7" className="font-bold">Last 7 days</SelectItem>
              <SelectItem value="30" className="font-bold">Last 30 days</SelectItem>
              <SelectItem value="90" className="font-bold">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admin Net Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-[#377771] dark:text-[#4CE0B3]">${analytics.summary.adminNetRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[20px] border-border/50 bg-background shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform GMV</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-foreground">${analytics.summary.gmv.toFixed(2)}</p>
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

      <Card className="rounded-[24px] border-border/50 bg-background shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-extrabold text-foreground">Orders and Net Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.ordersByDay}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis yAxisId="left" orientation="left" stroke="#377771" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
              <YAxis yAxisId="right" orientation="right" stroke="#ED6A5E" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={10} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Area yAxisId="left" type="monotone" dataKey="orders" stroke="#377771" fill="#377771" fillOpacity={0.2} strokeWidth={3} />
              <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#ED6A5E" fill="#ED6A5E" fillOpacity={0.2} strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card className="rounded-[24px] border-border/50 bg-background shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-extrabold text-foreground">Payment Method Mix</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.paymentMethodBreakdown}
                  dataKey="count"
                  nameKey="method"
                  outerRadius={110}
                  innerRadius={70}
                  stroke="none"
                  paddingAngle={5}
                >
                  {analytics.paymentMethodBreakdown.map((entry, index) => (
                    <Cell key={`${entry.method}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-border/50 bg-background shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-extrabold text-foreground">Top Providers by Net Payout</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.topProviders} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={10} />
                <YAxis type="category" dataKey="restaurantName" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={120} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: 'transparent'}} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="revenue" fill="#377771" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
