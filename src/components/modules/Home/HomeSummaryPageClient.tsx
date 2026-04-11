"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  ChefHat,
  Clock3,
  Heart,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { HomeServices } from "@/services/home.services";
import { FavoriteServices } from "@/services/favorite.services";
import { queryKeys } from "@/lib/query/query-keys";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function HomeSummaryPageClient() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.homeSummary(),
    queryFn: () => HomeServices.getHomeSummary(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: mealFavoritesResponse } = useQuery({
    queryKey: queryKeys.mealFavorites("home"),
    queryFn: () => FavoriteServices.getMealFavorites({ page: 1, limit: 100 }),
    staleTime: 1000 * 60,
    retry: false,
  });

  const { data: providerFavoritesResponse } = useQuery({
    queryKey: queryKeys.providerFavorites("home"),
    queryFn: () => FavoriteServices.getProviderFavorites({ page: 1, limit: 100 }),
    staleTime: 1000 * 60,
    retry: false,
  });

  const favoriteMealIds = useMemo(() => {
    return new Set(
      ((mealFavoritesResponse?.data || []) as any[])
        .map((favorite) => favorite.meal?.id)
        .filter(Boolean)
    );
  }, [mealFavoritesResponse?.data]);

  const favoriteProviderIds = useMemo(() => {
    return new Set(
      ((providerFavoritesResponse?.data || []) as any[])
        .map((favorite) => favorite.provider?.id)
        .filter(Boolean)
    );
  }, [providerFavoritesResponse?.data]);

  const toggleMealFavoriteMutation = useMutation({
    mutationFn: (mealId: string) => FavoriteServices.toggleMealFavorite(mealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-favorites"] });
      queryClient.invalidateQueries({ queryKey: ["meal-favorite-state"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Unable to update meal favorites.");
    },
  });

  const toggleProviderFavoriteMutation = useMutation({
    mutationFn: (providerId: string) => FavoriteServices.toggleProviderFavorite(providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-favorites"] });
      queryClient.invalidateQueries({ queryKey: ["provider-favorite-state"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Unable to update restaurant favorites.");
    },
  });

  const summary = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-12 py-10">
        <Skeleton className="h-96 w-full rounded-3xl" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-72 w-full rounded-3xl" />
          <Skeleton className="h-72 w-full rounded-3xl" />
          <Skeleton className="h-72 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-20 pb-24 pt-10">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-900 px-6 py-16 text-white sm:px-10 lg:px-14">
        <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute -bottom-28 right-0 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" />

        <div className="relative grid gap-12 lg:grid-cols-2 lg:items-end">
          <div className="space-y-6">
            <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
              <Sparkles className="mr-2 h-3.5 w-3.5" /> Smart Food Discovery
            </p>
            <h1
              className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Curated meals from trusted kitchens, delivered with precision.
            </h1>
            <p className="max-w-2xl text-slate-200 sm:text-lg">
              Discover highly rated restaurants, build your next order in minutes, and keep your favorites one tap away.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="h-12 rounded-full bg-amber-400 px-7 font-bold text-slate-950 hover:bg-amber-300">
                <Link href="/meals">
                  Explore Meals <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-full border-white/30 bg-white/10 px-7 text-white hover:bg-white/20">
                <Link href="/restaurants">Browse Restaurants</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-white/15 bg-white/10 text-white backdrop-blur">
              <CardContent className="space-y-2 p-5">
                <div className="inline-flex rounded-full bg-emerald-300/20 p-2 text-emerald-200">
                  <Clock3 className="h-4 w-4" />
                </div>
                <h3 className="font-bold">Fast Checkout</h3>
                <p className="text-sm text-slate-200">One-click reorder and secure payment without friction.</p>
              </CardContent>
            </Card>
            <Card className="border-white/15 bg-white/10 text-white backdrop-blur">
              <CardContent className="space-y-2 p-5">
                <div className="inline-flex rounded-full bg-cyan-300/20 p-2 text-cyan-200">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h3 className="font-bold">Verified Providers</h3>
                <p className="text-sm text-slate-200">Order from restaurant profiles with transparent ratings.</p>
              </CardContent>
            </Card>
            <Card className="border-white/15 bg-white/10 text-white backdrop-blur sm:col-span-2">
              <CardContent className="space-y-2 p-5">
                <div className="inline-flex rounded-full bg-amber-300/20 p-2 text-amber-100">
                  <ChefHat className="h-4 w-4" />
                </div>
                <h3 className="font-bold">Today&apos;s curated picks</h3>
                <p className="text-sm text-slate-200">
                  {summary?.featuredMeals?.length || 0} featured meals and {summary?.topProviders?.length || 0} standout restaurants updated in real time.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Browse by taste</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Featured categories
            </h2>
          </div>
          <Link href="/meals" className="text-sm font-semibold text-amber-700 hover:text-amber-800">
            See all categories
          </Link>
        </div>

        {!summary?.featuredCategories?.length ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">No categories available yet.</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {summary.featuredCategories.map((category: any) => (
              <Link key={category.id} href={`/meals?categoryId=${category.id}`}>
                <Card className="group h-full border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg">
                  <CardContent className="space-y-2 px-4 py-6 text-center">
                    <p className="font-bold text-slate-900 group-hover:text-amber-700">{category.name}</p>
                    <p className="text-xs text-slate-500">{category._count?.meals || 0} meals</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Editor picks</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Featured meals
            </h2>
          </div>
          <Link href="/meals" className="text-sm font-semibold text-amber-700 hover:text-amber-800">
            View full menu
          </Link>
        </div>

        {!summary?.featuredMeals?.length ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">No featured meals yet.</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {summary.featuredMeals.map((meal: any) => {
              const providerTarget = meal.provider?.id || meal.providerId;

              return (
                <Card key={meal.id} className="overflow-hidden border-slate-200 bg-white transition-all hover:shadow-xl">
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    {meal.image ? (
                      <img src={meal.image} alt={meal.title} className="h-full w-full object-cover" />
                    ) : null}
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="absolute right-3 top-3 h-8 w-8 rounded-full bg-white/95"
                      onClick={() => toggleMealFavoriteMutation.mutate(meal.id)}
                      aria-label="Toggle favorite meal"
                    >
                      <Heart
                        className={`h-4 w-4 ${favoriteMealIds.has(meal.id) ? "fill-red-500 text-red-500" : "text-slate-500"}`}
                      />
                    </Button>
                  </div>
                  <CardContent className="space-y-3 p-5">
                    <p className="line-clamp-1 text-lg font-bold text-slate-900">{meal.title}</p>
                    <p className="line-clamp-2 text-sm text-slate-600">{meal.description}</p>
                    <p className="text-xs text-slate-500">
                      by <span className="font-semibold text-slate-700">{meal.provider?.restaurantName || "Restaurant"}</span>
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-extrabold text-slate-900">${Number(meal.price || 0).toFixed(2)}</span>
                      <Button asChild size="sm" variant="outline" className="rounded-full">
                        <Link href={providerTarget ? `/restaurant/${providerTarget}` : "/restaurants"}>View dish</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Restaurant spotlight</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Top providers
            </h2>
          </div>
          <Link href="/restaurants" className="text-sm font-semibold text-amber-700 hover:text-amber-800">
            Explore all restaurants
          </Link>
        </div>

        {!summary?.topProviders?.length ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">No providers available yet.</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {summary.topProviders.slice(0, 6).map((provider: any) => (
              <Card key={provider.id} className="border-slate-200 bg-white transition-all hover:shadow-xl">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold text-slate-900">{provider.restaurantName}</p>
                      <div className="mt-1 flex items-center text-sm text-slate-600">
                        <Star className="mr-1 h-4 w-4 fill-amber-400 text-amber-400" />
                        {provider.averageRating ?? "New"} · {provider.reviewCount || 0} reviews
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => toggleProviderFavoriteMutation.mutate(provider.id)}
                      aria-label="Toggle favorite restaurant"
                    >
                      <Heart
                        className={`h-4 w-4 ${favoriteProviderIds.has(provider.id) ? "fill-red-500 text-red-500" : "text-slate-500"}`}
                      />
                    </Button>
                  </div>

                  <p className="line-clamp-2 text-sm text-slate-600">
                    {provider.description || "Chef-crafted menu with reliable service and quality ingredients."}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="inline-flex items-center">
                      <MapPin className="mr-1 h-3.5 w-3.5" /> {provider.address || "Address not listed"}
                    </span>
                    <span>{provider.mealCount || provider.meals?.length || 0} meals</span>
                  </div>

                  <Button asChild className="mt-1 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-700">
                    <Link href={`/restaurant/${provider.id}`}>Open restaurant</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Customer stories</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            What people are saying
          </h2>
        </div>

        {!summary?.testimonials?.length ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">No testimonials yet.</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {summary.testimonials.slice(0, 6).map((testimonial: any) => (
              <Card key={testimonial.id} className="border-slate-200 bg-white">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={`${testimonial.id}-${index}`}
                        className={`h-4 w-4 ${index < Number(testimonial.rating || 0) ? "fill-amber-400" : "text-slate-300"}`}
                      />
                    ))}
                  </div>
                  <p className="line-clamp-4 text-sm leading-6 text-slate-700">
                    “{testimonial.comment || "Great food and reliable experience."}”
                  </p>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{testimonial.customer?.name || "Customer"}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(testimonial.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-teal-50 px-6 py-14 sm:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <h3 className="text-3xl font-extrabold text-slate-900 sm:text-4xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Ready for your next order?
          </h3>
          <p className="mt-4 text-slate-600 sm:text-lg">
            Pick your favorites, reorder in one click, and enjoy a smooth checkout every time.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild className="h-12 rounded-full bg-slate-900 px-7 font-bold text-white hover:bg-slate-700">
              <Link href="/meals">Start ordering</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-full px-7">
              <Link href="/customer/favorites">Open favorites</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
