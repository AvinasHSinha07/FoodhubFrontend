"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminServices } from "@/services/admin.services";
import { ProviderProfileServices } from "@/services/providerProfile.services";
import { CategoryServices } from "@/services/category.services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Store, Box, ShoppingCart } from "lucide-react";
import { queryKeys } from "@/lib/query/query-keys";

export default function AdminDashboardPageClient() {
  const { data: usersRes, isLoading: isUsersLoading } = useQuery({
    queryKey: queryKeys.adminUsers(""),
    queryFn: () => AdminServices.getAllUsers(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: ordersRes, isLoading: isOrdersLoading } = useQuery({
    queryKey: queryKeys.adminOrders(),
    queryFn: () => AdminServices.getAllOrders(),
    staleTime: 1000 * 60 * 3,
  });

  const { data: providersRes, isLoading: isProvidersLoading } = useQuery({
    queryKey: queryKeys.providers(""),
    queryFn: () => ProviderProfileServices.getAllProviders({ page: 1, limit: 20 }),
    staleTime: 1000 * 60 * 10,
  });

  const { data: categoriesRes, isLoading: isCategoriesLoading } = useQuery({
    queryKey: queryKeys.categories(),
    queryFn: () => CategoryServices.getCategories(),
    staleTime: 1000 * 60 * 60,
  });

  const isLoading = isUsersLoading || isOrdersLoading || isProvidersLoading || isCategoriesLoading;

  const stats = {
    users: usersRes?.data.length || 0,
    orders: ordersRes?.data.length || 0,
    providers: providersRes?.data.length || 0,
    categories: categoriesRes?.data.length || 0,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Dashboard</h1>
        <p className="text-gray-500">Monitor overall activity and system metrics.</p>
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
