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
import { Button } from "@/components/ui/button";

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
    return "bg-[#377771]/10 text-[#377771] border-[#377771]/20 dark:bg-[#4CE0B3]/10 dark:text-[#4CE0B3] dark:border-[#4CE0B3]/20";
  }

  if (status === "BLOCKED") {
    return "bg-[#ED6A5E]/10 text-[#ED6A5E] border-[#ED6A5E]/20";
  }

  return "bg-muted text-slate-500 border-border/50";
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
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Manage Providers</h1>
        <p className="text-slate-500 font-medium mt-1">View all provider accounts and restaurant profiles.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by restaurant, email, or address"
          className="h-12 pl-11 rounded-[14px] bg-background border-border/50 focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3] font-medium"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[400px] w-full rounded-[24px]" />
        </div>
      ) : filteredProviders.length === 0 ? (
        <Card className="text-center py-24 bg-background border-border/50 rounded-[24px] shadow-sm">
          <div className="mx-auto h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-6">
            <Store className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground">No Providers Found</h2>
          <p className="text-slate-500 font-medium mt-2">No active restaurants matching your search.</p>
        </Card>
      ) : (
        <Card className="rounded-[24px] border-border/50 bg-background shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/20 pb-6 pt-8 px-8">
            <CardTitle className="text-xl font-extrabold text-foreground">Registered Providers</CardTitle>
            <CardDescription className="text-slate-500 font-medium text-base mt-1">Provider profile and account status overview.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/20 border-b border-border/50 text-slate-500 uppercase text-xs font-bold tracking-widest">
                <tr>
                  <th className="px-8 py-5">Restaurant</th>
                  <th className="px-8 py-5">Contact</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Location</th>
                  <th className="px-8 py-5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {filteredProviders.map((provider) => (
                  <tr key={provider.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="font-bold text-foreground text-base group-hover:text-[#377771] dark:group-hover:text-[#4CE0B3] transition-colors">{provider.restaurantName}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{provider.cuisineType || "General"}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="font-bold text-foreground">{provider.user?.name || "Unknown"}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{provider.user?.email || "No email"}</p>
                    </td>
                    <td className="px-8 py-5">
                      <Badge variant="outline" className={`font-bold px-3 py-1 rounded-[8px] tracking-wide ${getStatusBadgeClass(provider.user?.status)}`}>
                        {provider.user?.status || "UNKNOWN"}
                      </Badge>
                    </td>
                    <td className="px-8 py-5">
                      <p className="font-medium text-slate-600 dark:text-slate-400 line-clamp-1">{provider.address}</p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Button asChild variant="ghost" className="h-9 px-4 rounded-[10px] font-bold text-[#377771] dark:text-[#4CE0B3] hover:bg-[#377771]/10 dark:hover:bg-[#4CE0B3]/10">
                        <Link href={`/restaurant/${provider.id}`}>
                          View Store
                        </Link>
                      </Button>
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
