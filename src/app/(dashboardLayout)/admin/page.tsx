"use client";

import { useEffect, useState } from "react";
import { AdminServices } from "@/services/admin.services";
import { ProviderProfileServices } from "@/services/providerProfile.services";
import { CategoryServices } from "@/services/category.services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Store, Box, ShoppingCart } from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    providers: 0,
    categories: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, ordersRes, providersRes, catsRes] = await Promise.all([
          AdminServices.getAllUsers(),
          AdminServices.getAllOrders(),
          ProviderProfileServices.getAllProviders(),
          CategoryServices.getCategories(),
        ]);

        setStats({
          users: usersRes.data.length,
          orders: ordersRes.data.length,
          providers: providersRes.data.length,
          categories: catsRes.data.length,
        });
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

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
