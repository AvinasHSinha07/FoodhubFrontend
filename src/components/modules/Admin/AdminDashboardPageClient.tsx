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
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Dashboard</h1>
          <p className="text-gray-500">Monitor overall activity and system metrics.</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isFetching}>
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.users}</div>
              <p className="text-xs text-gray-400 mt-1">Platform-wide registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Providers</CardTitle>
              <Store className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.providers}</div>
              <p className="text-xs text-gray-400 mt-1">Active restaurant vendors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Categories</CardTitle>
              <Box className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.categories}</div>
              <p className="text-xs text-gray-400 mt-1">Cuisines and food types</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.orders}</div>
              <p className="text-xs text-gray-400 mt-1">Life-time food orders</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}