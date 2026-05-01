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
import { BrainCircuit, RefreshCw, Sparkles, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  // ── AI Insights: manual fetch, cached 5 min ────────────────────────────────
  const {
    data: insightsData,
    isFetching: isInsightsFetching,
    refetch: refetchInsights,
    isError: isInsightsError,
  } = useQuery({
    queryKey: queryKeys.adminAiInsights(days),
    queryFn: () => AdminServices.getAdminAiInsights(days),
    enabled: false, // Only fetch when user clicks the button
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1,
  });

  const insight = (insightsData?.data as { insight?: string })?.insight ?? null;

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

      {/* ── AI Insights Panel ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[24px] border border-border/50 bg-gradient-to-br from-[#0A0F1E] to-[#0f1e1c] shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-10 w-64 h-64 bg-[#ED6A5E]/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-20 -right-10 w-64 h-64 bg-[#377771]/15 rounded-full blur-[80px]" />
        </div>

        <div className="relative px-6 pt-6 pb-5 flex flex-col sm:flex-row sm:items-center gap-4 border-b border-white/8">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#ED6A5E] to-[#FF8E72] flex items-center justify-center shadow-lg">
              <BrainCircuit className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">AI Platform Insights</h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#4CE0B3]/15 text-[#4CE0B3] uppercase tracking-widest">
                  <Sparkles className="w-2.5 h-2.5" /> Gemini
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">AI-powered analysis of the last {days} days of platform data</p>
            </div>
          </div>

          <Button
            id="generate-insights-btn"
            onClick={() => refetchInsights()}
            disabled={isInsightsFetching}
            className="flex-shrink-0 h-10 px-5 rounded-[12px] bg-gradient-to-r from-[#ED6A5E] to-[#FF8E72] hover:from-[#FF8E72] hover:to-[#ED6A5E] text-white font-bold shadow-lg shadow-[#ED6A5E]/20 transition-all disabled:opacity-60 gap-2"
          >
            {isInsightsFetching ? (
              <><RefreshCw className="h-4 w-4 animate-spin" /> Analysing...</>
            ) : insight ? (
              <><RefreshCw className="h-4 w-4" /> Regenerate</>
            ) : (
              <><TrendingUp className="h-4 w-4" /> Generate Insights</>
            )}
          </Button>
        </div>

        <div className="relative px-6 py-6 min-h-[96px] flex items-center">
          <AnimatePresence mode="wait">
            {isInsightsFetching ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full space-y-3"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 bg-[#ED6A5E] rounded-full animate-bounce [animation-delay:0ms]" />
                  <div className="w-2 h-2 bg-[#ED6A5E] rounded-full animate-bounce [animation-delay:150ms]" />
                  <div className="w-2 h-2 bg-[#ED6A5E] rounded-full animate-bounce [animation-delay:300ms]" />
                  <span className="text-sm text-slate-400 font-medium">Gemini is analysing your platform data...</span>
                </div>
                <Skeleton className="h-4 w-full bg-white/5" />
                <Skeleton className="h-4 w-4/5 bg-white/5" />
                <Skeleton className="h-4 w-3/5 bg-white/5" />
              </motion.div>
            ) : isInsightsError ? (
              <motion.p
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-[#ED6A5E] font-medium"
              >
                Failed to generate insights. Please try again.
              </motion.p>
            ) : insight ? (
              <motion.div
                key="insight"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full"
              >
                <p className="text-sm sm:text-base leading-relaxed text-slate-200 font-medium">
                  {insight}
                </p>
                <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <Sparkles className="w-3 h-3 text-[#4CE0B3]" />
                  Generated by Gemini AI · Based on last {days} days of real platform data
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center w-full py-2 text-center"
              >
                <BrainCircuit className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-slate-500 text-sm font-medium">Click &ldquo;Generate Insights&rdquo; to get an AI summary of your platform&apos;s performance</p>
              </motion.div>
            )}
          </AnimatePresence>
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
