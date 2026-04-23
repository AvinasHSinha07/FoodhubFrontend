"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProviderProfileServices } from "@/services/providerProfile.services";
import { FavoriteServices } from "@/services/favorite.services";
import { IProviderProfile } from "@/types/user.types";
import { queryKeys } from "@/lib/query/query-keys";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Utensils, Star, ArrowRight, Heart } from "lucide-react";
import PaginationControls from "@/components/shared/list/PaginationControls";
import SortControl from "@/components/shared/list/SortControl";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";

export default function RestaurantsPageClient() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const queryString = searchParams?.toString() || "";
  const searchValueFromUrl = searchParams?.get("search")?.trim() || "";

  const [searchTerm, setSearchTerm] = useState(searchValueFromUrl);
  const [sortValue, setSortValue] = useState(
    `${searchParams?.get("sortBy") || "createdAt"}:${searchParams?.get("sortOrder") || "desc"}`
  );

  useEffect(() => {
    setSearchTerm(searchValueFromUrl);
    setSortValue(`${searchParams?.get("sortBy") || "createdAt"}:${searchParams?.get("sortOrder") || "desc"}`);
  }, [searchValueFromUrl]);

  const page = Number(searchParams?.get("page") || "1");
  const [sortBy, sortOrder] = sortValue.split(":");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.providers(queryString),
    queryFn: () =>
      ProviderProfileServices.getAllProviders({
        searchTerm: searchValueFromUrl || undefined,
        page,
        limit: 9,
        sortBy,
        sortOrder: (sortOrder as "asc" | "desc") || "desc",
      }),
    staleTime: 1000 * 60 * 10,
  });

  const providers = data?.data || [];
  const providersMeta = data?.meta;

  const { data: providerFavoritesResponse } = useQuery({
    queryKey: queryKeys.providerFavorites("restaurants-page"),
    queryFn: () => FavoriteServices.getProviderFavorites({ page: 1, limit: 100 }),
    staleTime: 1000 * 60,
    retry: false,
  });

  const favoriteProviderIds = useMemo(() => {
    return new Set(
      ((providerFavoritesResponse?.data || []) as any[])
        .map((favorite) => favorite.provider?.id)
        .filter(Boolean)
    );
  }, [providerFavoritesResponse?.data]);

  const toggleProviderFavoriteMutation = useMutation({
    mutationFn: (providerId: string) => FavoriteServices.toggleProviderFavorite(providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-favorites"] });
      queryClient.invalidateQueries({ queryKey: ["provider-favorite-state"] });
    },
    onError: (mutationError: unknown) => {
      toast.error(getApiErrorMessage(mutationError, "Unable to update favorites."));
    },
  });

  const filteredProviders = useMemo(() => {
    if (!searchValueFromUrl) {
      return providers;
    }

    return providers.filter(
      (provider: IProviderProfile) =>
        provider.restaurantName.toLowerCase().includes(searchValueFromUrl.toLowerCase()) ||
        (provider.cuisineType &&
          provider.cuisineType.toLowerCase().includes(searchValueFromUrl.toLowerCase()))
    );
  }, [providers, searchValueFromUrl]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextParams = new URLSearchParams(searchParams?.toString());
    if (searchTerm.trim()) {
      nextParams.set("search", searchTerm.trim());
    } else {
      nextParams.delete("search");
    }

    const nextQueryString = nextParams.toString();
    router.replace(nextQueryString ? `${pathname}?${nextQueryString}` : pathname, {
      scroll: false,
    });
  };

  const updateParams = (updates: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams?.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    });

    const nextQueryString = nextParams.toString();
    router.replace(nextQueryString ? `${pathname}?${nextQueryString}` : pathname, {
      scroll: false,
    });
  };

  const handleSortChange = (value: string) => {
    setSortValue(value);
    const [nextSortBy, nextSortOrder] = value.split(":");
    updateParams({ sortBy: nextSortBy, sortOrder: nextSortOrder, page: "1" });
  };

  const handlePageChange = (nextPage: number) => {
    updateParams({ page: String(nextPage) });
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans" style={{ fontFamily: "var(--font-sora)" }}>
      <div className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] w-125 h-125 bg-indigo-500/30 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-125 h-125 bg-pink-500/30 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-20"></div>
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Discover Local <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-indigo-400">Culinary Stars</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-medium">
            Explore highly-rated restaurants, uncover hidden gems, and find your next favorite meal.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-pink-500 to-indigo-500 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-white/10 backdrop-blur-xl rounded-full border border-white/20 p-2 shadow-2xl">
              <Search className="ml-4 h-6 w-6 text-slate-300" />
              <Input
                placeholder="Search by restaurant name or cuisine..."
                className="pl-4 py-6 bg-transparent border-none text-white placeholder:text-slate-400 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <Button type="submit" className="rounded-full px-8 py-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md">
                Search
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-8 relative z-20">
        <div className="flex justify-end mb-4 mt-6">
          <SortControl
            value={sortValue}
            onValueChange={handleSortChange}
            options={[
              { label: "Newest", value: "createdAt:desc" },
              { label: "Oldest", value: "createdAt:asc" },
              { label: "Name: A-Z", value: "restaurantName:asc" },
              { label: "Name: Z-A", value: "restaurantName:desc" },
            ]}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
                <Skeleton className="h-56 w-full rounded-2xl mb-4" />
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-1/2 mb-6" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-32 bg-white rounded-3xl shadow-sm border border-slate-100 mt-16 max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-rose-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3" style={{ fontFamily: "var(--font-space-grotesk)" }}>Unable to load restaurants</h3>
            <p className="text-slate-500 text-lg">{getApiErrorMessage(error, "Please refresh and try again.")}</p>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl shadow-sm border border-slate-100 mt-16 max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-indigo-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3" style={{ fontFamily: "var(--font-space-grotesk)" }}>No restaurants found</h3>
            <p className="text-slate-500 text-lg">Try adjusting your search terms or check back later.</p>
            <Button
              onClick={() => {
                setSearchTerm("");
                router.replace(pathname, { scroll: false });
              }}
              variant="outline"
              className="mt-8 rounded-full"
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
              {filteredProviders.map((provider) => {
              const reviews = provider.meals?.flatMap((meal: any) => meal.reviews || []) || [];
              const averageRating =
                reviews.length > 0
                  ? (reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / reviews.length).toFixed(1)
                  : "New";
              const reviewCount = reviews.length;

              return (
                <Card key={provider.id} className="overflow-hidden py-0 border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group rounded-3xl bg-white flex flex-col h-full">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={provider.bannerImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800"}
                      alt={provider.restaurantName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-80" />

                    <div className="absolute top-4 left-4 flex gap-2">
                      {provider.cuisineType && (
                        <Badge className="bg-white/90 text-slate-900 hover:bg-white backdrop-blur-sm border-none shadow-sm font-bold tracking-wide">
                          {provider.cuisineType}
                        </Badge>
                      )}
                      <Badge
                        className={
                          provider.isOpenNow
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none"
                            : "bg-rose-100 text-rose-700 hover:bg-rose-100 border-none"
                        }
                      >
                        {provider.isOpenNow ? "Open" : "Closed"}
                      </Badge>
                    </div>

                    {provider.logo ? (
                      <img
                        src={provider.logo}
                        alt={`${provider.restaurantName} logo`}
                        className="absolute -bottom-6 right-6 w-16 h-16 rounded-xl border-4 border-white shadow-lg object-cover bg-white z-10"
                      />
                    ) : (
                      <div className="absolute -bottom-6 right-6 w-16 h-16 rounded-xl border-4 border-white shadow-lg bg-indigo-50 flex items-center justify-center z-10">
                        <Utensils className="w-6 h-6 text-indigo-400" />
                      </div>
                    )}
                  </div>

                  <CardHeader className="pt-8 pb-3 px-6 shrink-0 relative">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <CardTitle className="text-2xl font-bold text-slate-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                          {provider.restaurantName}
                        </CardTitle>
                        <div className="flex items-center gap-1 mt-1 font-semibold text-sm text-yellow-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span>{averageRating}</span>
                          <span className="text-slate-400 ml-1 font-normal">
                            {reviewCount > 0 ? `(${reviewCount} reviews)` : "(No reviews yet)"}
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => toggleProviderFavoriteMutation.mutate(provider.id)}
                        aria-label="Toggle favorite restaurant"
                      >
                        <Heart
                          className={`h-4 w-4 ${favoriteProviderIds.has(provider.id) ? "fill-red-500 text-red-500" : "text-slate-500"}`}
                        />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="px-6 pb-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-4 mb-6">
                      <CardDescription className="line-clamp-2 text-slate-500 leading-relaxed">
                        {provider.description || "A wonderful place to grab a bite. Experience amazing flavors and top-tier service."}
                      </CardDescription>

                      <div className="flex items-start text-sm text-slate-600 bg-slate-50 rounded-xl p-3">
                        <MapPin className="w-4 h-4 text-indigo-500 mr-2 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{provider.address || "Address not provided"}</span>
                      </div>

                      <p className="text-xs text-slate-500">
                        {provider.availabilityLabel || "Availability not configured"}
                        {provider.estimatedReadyInMinutes
                          ? ` • Approx ${provider.estimatedReadyInMinutes} min prep`
                          : ""}
                      </p>
                    </div>

                    <Button asChild className="w-full bg-slate-900 hover:bg-indigo-600 text-white rounded-xl shadow-md py-6 group-hover:shadow-lg transition-all duration-300 font-bold overflow-hidden relative">
                      <Link href={`/restaurant/${provider.id}`}>
                        <span className="relative z-10 flex items-center justify-center">
                          View Full Menu
                          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
              })}
            </div>
            <PaginationControls meta={providersMeta} onPageChange={handlePageChange} isLoading={isLoading} />
          </>
        )}
      </div>
    </div>
  );
}
