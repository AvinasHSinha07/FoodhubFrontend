"use client";

import { useMemo } from "react";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ProviderProfileServices } from "@/services/providerProfile.services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Store, Search } from "lucide-react";
import { queryKeys } from "@/lib/query/query-keys";

type ProviderRow = {
  id: string;
  restaurantName: string;
  cuisineType?: string | null;
  address: string;
  user?: {
    id: string;
    name: string;
    email: string;
    status: string;
  };
};

const getStatusBadgeClass = (status?: string) => {
  if (status === "ACTIVE") {
    return "bg-green-100 text-green-800 border-green-200";
  }

  if (status === "BLOCKED") {
    return "bg-red-100 text-red-800 border-red-200";
  }

  return "bg-gray-100 text-gray-700 border-gray-200";
};

export default function AdminProvidersPageClient() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.providers(""),
    queryFn: () => ProviderProfileServices.getAllProviders({ page: 1, limit: 50 }),
    staleTime: 1000 * 60 * 10,
  });

  const providers = (data?.data || []) as ProviderRow[];

  const filteredProviders = useMemo(() => {
    const term = search.toLowerCase();

    if (!term) {
      return providers;
    }

    return providers.filter((provider) =>
      provider.restaurantName.toLowerCase().includes(term) ||
      provider.address.toLowerCase().includes(term) ||
      provider.user?.email?.toLowerCase().includes(term)
    );
  }, [providers, search]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Providers</h1>
        <p className="text-gray-500">View all provider accounts and restaurant profiles.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by restaurant, email, or address"
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : filteredProviders.length === 0 ? (
        <Card className="text-center py-16 bg-gray-50">
          <Store className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h2 className="text-xl font-semibold text-gray-700">No providers found</h2>
          <p className="text-gray-500 mt-2">Try another search term.</p>
        </Card>
      ) : (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Registered Providers</CardTitle>
            <CardDescription>Provider profile and account status overview.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b text-gray-600 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Restaurant</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProviders.map((provider) => (
                  <tr key={provider.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{provider.restaurantName}</p>
                      <p className="text-xs text-gray-500">{provider.cuisineType || "General"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{provider.user?.name || "Unknown"}</p>
                      <p className="text-xs text-gray-500">{provider.user?.email || "No email"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={getStatusBadgeClass(provider.user?.status)}>
                        {provider.user?.status || "UNKNOWN"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{provider.address}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/restaurant/${provider.id}`} className="text-orange-600 hover:text-orange-700 font-medium">
                        View Store
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
