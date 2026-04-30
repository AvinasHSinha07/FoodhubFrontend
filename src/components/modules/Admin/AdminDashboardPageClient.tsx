"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminServices } from "@/services/admin.services";
import { ProviderProfileServices } from "@/services/providerProfile.services";
import { CategoryServices } from "@/services/category.services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Store, Box, ShoppingCart } from "lucide-react";
import { queryKeys } from "@/lib/query/query-keys";
import { Button } from "@/components/ui/button";

const DASHBOARD_COUNT_QUERY = "page=1&limit=1";

export default function AdminDashboardPageClient() {
  const { 
    data: usersRes, 
    isLoading: isUsersLoading, 
    isFetching: isUsersFetching,
    refetch: refetchUsers 
  } = useQuery({
    queryKey: queryKeys.adminUsers(DASHBOARD_COUNT_QUERY),
    queryFn: () => AdminServices.getAllUsers({ page: 1, limit: 1 }),
    staleTime: 1000 * 15, 
    refetchInterval: 1000 * 15, // Refetch every 15 seconds
    refetchOnWindowFocus: true,
  });

  const { 
    data: ordersRes, 
    isLoading: isOrdersLoading,
    isFetching: isOrdersFetching,
    refetch: refetchOrders 
  } = useQuery({
    queryKey: queryKeys.adminOrders(DASHBOARD_COUNT_QUERY),
    queryFn: () => AdminServices.getAllOrders({ page: 1, limit: 1 }),
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 15, // Refetch every 15 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const { 
    data: providersRes, 
    isLoading: isProvidersLoading,
    isFetching: isProvidersFetching,
    refetch: refetchProviders 
  } = useQuery({
    queryKey: queryKeys.providers(DASHBOARD_COUNT_QUERY),
    queryFn: () => ProviderProfileServices.getAllProviders({ page: 1, limit: 1 }),
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 60 * 15, // Refetch every 15 seconds
    refetchOnWindowFocus: true,
  });

  const { 
    data: categoriesRes, 
    isLoading: isCategoriesLoading,
    isFetching: isCategoriesFetching,
    refetch: refetchCategories 
  } = useQuery({
    queryKey: queryKeys.categories(),
    queryFn: () => CategoryServices.getCategories(),
    staleTime: 1000 * 30, // Categories change less often, 30s is fine
    refetchInterval: 1000 * 30,
    refetchOnWindowFocus: true,
  });

  // Initial load state
  const isLoading = isUsersLoading || isOrdersLoading || isProvidersLoading || isCategoriesLoading;
  
  // Background fetching state (for the refresh button)
  const isFetching = isUsersFetching || isOrdersFetching || isProvidersFetching || isCategoriesFetching;

  const handleRefresh = () => {
    refetchUsers();
    refetchOrders();
    refetchProviders();
    refetchCategories();
  };

  const stats = {
    users: usersRes?.meta?.total ?? usersRes?.data.length ?? 0,
    orders: ordersRes?.meta?.total ?? ordersRes?.data.length ?? 0,
    providers: providersRes?.meta?.total ?? providersRes?.data.length ?? 0,
    categories: categoriesRes?.meta?.total ?? categoriesRes?.data.length ?? 0,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Platform Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Monitor overall activity and system metrics.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh} 
          disabled={isFetching}
          className="h-12 px-6 rounded-[14px] border-border/50 font-bold hover:bg-muted text-foreground transition-all shrink-0"
        >
          {isFetching ? "Refreshing..." : "Refresh Metrics"}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-40 w-full rounded-[24px]" />
          <Skeleton className="h-40 w-full rounded-[24px]" />
          <Skeleton className="h-40 w-full rounded-[24px]" />
          <Skeleton className="h-40 w-full rounded-[24px]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-[24px] border-border/50 bg-background shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Users</CardTitle>
              <div className="h-10 w-10 rounded-full bg-[#377771]/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-[#377771] dark:text-[#4CE0B3]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-foreground">{stats.users}</div>
              <p className="text-xs font-medium text-slate-500 mt-2">Platform-wide registered users</p>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-border/50 bg-background shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Providers</CardTitle>
              <div className="h-10 w-10 rounded-full bg-[#ED6A5E]/10 flex items-center justify-center">
                <Store className="h-5 w-5 text-[#ED6A5E]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-foreground">{stats.providers}</div>
              <p className="text-xs font-medium text-slate-500 mt-2">Active restaurant vendors</p>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-border/50 bg-background shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Categories</CardTitle>
              <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Box className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-foreground">{stats.categories}</div>
              <p className="text-xs font-medium text-slate-500 mt-2">Cuisines and food types</p>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-border/50 bg-background shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Orders</CardTitle>
              <div className="h-10 w-10 rounded-full bg-[#377771]/10 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-[#377771] dark:text-[#4CE0B3]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-foreground">{stats.orders}</div>
              <p className="text-xs font-medium text-slate-500 mt-2">Life-time food orders</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}