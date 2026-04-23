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
  Quote,
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
      <div className="mx-auto max-w-7xl space-y-16 px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-[500px] w-full rounded-[2.5rem]" />
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-24 px-4 pb-24 pt-10 sm:px-6 lg:px-8 lg:space-y-32">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 px-6 py-20 text-white sm:px-12 lg:px-16 lg:py-24">
        {/* Modern ambient glows */}
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-amber-500/20 blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-teal-500/20 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

        <div className="relative z-10 grid gap-16 lg:grid-cols-12 lg:items-center">
          <div className="space-y-8 lg:col-span-7">
            <div className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 backdrop-blur-md">
              <Sparkles className="mr-2 h-4 w-4" /> Smart Food Discovery
            </div>
            <h1
              className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-7xl"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Curated meals from <span className="text-amber-400">trusted kitchens.</span>
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
              Discover highly rated restaurants, build your next order in minutes, and keep your favorites exactly one tap away.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button asChild className="h-14 rounded-full bg-amber-400 px-8 text-base font-bold text-slate-950 transition-all hover:scale-105 hover:bg-amber-300 hover:shadow-[0_0_40px_8px_rgba(251,191,36,0.3)]">
                <Link href="/meals">
                  Explore Meals <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-14 rounded-full border-white/20 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:text-white">
                <Link href="/restaurants">Browse Restaurants</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5">
            <Card className="border-white/10 bg-white/5 text-white backdrop-blur-xl transition-all hover:bg-white/10">
              <CardContent className="space-y-3 p-6">
                <div className="inline-flex rounded-2xl bg-emerald-400/20 p-3 text-emerald-300">
                  <Clock3 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-50">Fast Checkout</h3>
                <p className="text-sm leading-relaxed text-slate-400">One-click reorder and secure payment without friction.</p>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/5 text-white backdrop-blur-xl transition-all hover:bg-white/10">
              <CardContent className="space-y-3 p-6">
                <div className="inline-flex rounded-2xl bg-cyan-400/20 p-3 text-cyan-300">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-50">Verified Providers</h3>
                <p className="text-sm leading-relaxed text-slate-400">Order from restaurant profiles with transparent ratings.</p>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/5 text-white backdrop-blur-xl transition-all hover:bg-white/10 sm:col-span-2">
              <CardContent className="space-y-3 p-6">
                <div className="inline-flex rounded-2xl bg-amber-400/20 p-3 text-amber-300">
                  <ChefHat className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-50">Today&apos;s Curated Picks</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  <span className="font-semibold text-amber-400">{summary?.featuredMeals?.length || 0}</span> featured meals and <span className="font-semibold text-amber-400">{summary?.topProviders?.length || 0}</span> standout restaurants updated in real time.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-600">Browse by taste</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Featured categories
            </h2>
          </div>
          <Link href="/meals" className="group flex items-center text-sm font-bold text-slate-600 transition-colors hover:text-amber-600">
            See all categories <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {!summary?.featuredCategories?.length ? (
          <Card className="border-dashed border-slate-200 bg-slate-50 shadow-none">
            <CardContent className="py-16 text-center text-slate-500">No categories available yet.</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {summary.featuredCategories.map((category: any) => (
              <Link key={category.id} href={`/meals?categoryId=${category.id}`}>
                <Card className="group h-full border-0 bg-white ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:bg-slate-900 hover:ring-slate-900 hover:shadow-xl">
                  <CardContent className="flex flex-col items-center justify-center space-y-2 p-6 text-center">
                    <p className="font-bold text-slate-900 transition-colors group-hover:text-white">{category.name}</p>
                    <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 transition-colors group-hover:bg-slate-800 group-hover:text-slate-300">
                      {category._count?.meals || 0} meals
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* FEATURED MEALS SECTION */}
<section className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-600">Editor picks</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Featured meals
            </h2>
          </div>
          <Link href="/meals" className="group flex items-center text-sm font-bold text-slate-600 transition-colors hover:text-amber-600">
            View full menu <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {!summary?.featuredMeals?.length ? (
          <Card className="border-dashed border-slate-200 bg-slate-50/50 shadow-none">
            <CardContent className="py-16 text-center text-slate-500">No featured meals yet.</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {summary.featuredMeals.map((meal: any) => {
              const providerTarget = meal.provider?.id || meal.providerId;

              return (
                <Card 
                  key={meal.id} 
                  className="group flex flex-col overflow-hidden border-0 bg-white p-0 ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:ring-amber-200"
                >
                  {/* Image Container - Fixed Whitespace Issue */}
                  <div className="relative block w-full shrink-0 overflow-hidden bg-slate-100 pt-[75%]">
                    {/* pt-[75%] creates a perfect 4:3 aspect ratio block */}
                    
                    {meal.image ? (
                      <img 
                        src={meal.image} 
                        alt={meal.title} 
                        className="absolute inset-0 block h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                        <ChefHat className="h-12 w-12 opacity-50" />
                      </div>
                    )}
                    
                    {/* Gradient overlay for better button contrast */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="absolute right-3 top-3 z-10 h-9 w-9 rounded-full bg-white/95 shadow-sm backdrop-blur transition-all hover:scale-110 hover:bg-white"
                      onClick={(e) => {
                        e.preventDefault(); // Prevents link clicks if you wrap the card in a Link later
                        toggleMealFavoriteMutation.mutate(meal.id);
                      }}
                      aria-label="Toggle favorite meal"
                    >
                      <Heart
                        className={`h-4 w-4 transition-colors ${favoriteMealIds.has(meal.id) ? "fill-red-500 text-red-500" : "text-slate-400 hover:text-red-500"}`}
                      />
                    </Button>
                  </div>

                  {/* Card Content area */}
                  <CardContent className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="line-clamp-1 text-lg font-bold text-slate-900">{meal.title}</h3>
                        <span className="shrink-0 text-lg font-extrabold text-amber-600">
                          ${Number(meal.price || 0).toFixed(2)}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
                        {meal.description}
                      </p>
                    </div>
                    
                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                          {meal.provider?.restaurantName?.charAt(0).toUpperCase() || "R"}
                        </div>
                        <p className="line-clamp-1 text-xs font-semibold text-slate-700">
                          {meal.provider?.restaurantName || "Restaurant"}
                        </p>
                      </div>
                      <Button asChild size="sm" className="h-8 rounded-full bg-slate-900 px-4 text-xs font-semibold text-white transition-colors hover:bg-amber-500">
                        <Link href={providerTarget ? `/restaurant/${providerTarget}` : "/restaurants"}>
                          View Dish
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* TOP PROVIDERS SECTION */}
      <section className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-600">Restaurant spotlight</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Top providers
            </h2>
          </div>
          <Link href="/restaurants" className="group flex items-center text-sm font-bold text-slate-600 transition-colors hover:text-amber-600">
            Explore all restaurants <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {!summary?.topProviders?.length ? (
          <Card className="border-dashed border-slate-200 bg-slate-50 shadow-none">
            <CardContent className="py-16 text-center text-slate-500">No providers available yet.</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {summary.topProviders.slice(0, 6).map((provider: any) => (
              <Card key={provider.id} className="group border-0 bg-white ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-xl font-bold text-amber-700">
                        {provider.restaurantName?.charAt(0).toUpperCase() || "R"}
                      </div>
                      <div>
                        <p className="text-xl font-bold text-slate-900">{provider.restaurantName}</p>
                        <div className="mt-1 flex items-center text-sm font-medium text-slate-600">
                          <Star className="mr-1.5 h-4 w-4 fill-amber-400 text-amber-400" />
                          {provider.averageRating ?? "New"} 
                          <span className="mx-1.5 text-slate-300">•</span> 
                          {provider.reviewCount || 0} reviews
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 shrink-0 rounded-full hover:bg-slate-100"
                      onClick={() => toggleProviderFavoriteMutation.mutate(provider.id)}
                      aria-label="Toggle favorite restaurant"
                    >
                      <Heart
                        className={`h-5 w-5 transition-colors ${favoriteProviderIds.has(provider.id) ? "fill-red-500 text-red-500" : "text-slate-400"}`}
                      />
                    </Button>
                  </div>

                  <p className="mt-6 line-clamp-2 text-sm leading-relaxed text-slate-500">
                    {provider.description || "Chef-crafted menu with reliable service and quality ingredients."}
                  </p>

                  <div className="mt-6 flex items-center justify-between rounded-2xl bg-slate-50 p-4 text-sm font-medium text-slate-600">
                    <span className=" flex items-center">
                      <MapPin className="mr-2 h-4 w-4 text-slate-400" /> 
                      <span className="line-clamp-1">{provider.address || "Location unavailable"}</span>
                    </span>
                    <span className="shrink-0 whitespace-nowrap text-amber-600">
                      {provider.mealCount || provider.meals?.length || 0} dishes
                    </span>
                  </div>

                  <Button asChild className="mt-6 h-12 w-full rounded-xl bg-slate-900 text-base font-bold text-white transition-all hover:bg-slate-800">
                    <Link href={`/restaurant/${provider.id}`}>Visit Restaurant</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="space-y-8">
        <div className="text-center sm:text-left">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-600">Customer stories</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            What people are saying
          </h2>
        </div>

        {!summary?.testimonials?.length ? (
          <Card className="border-dashed border-slate-200 bg-slate-50 shadow-none">
            <CardContent className="py-16 text-center text-slate-500">No testimonials yet.</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {summary.testimonials.slice(0, 6).map((testimonial: any) => (
              <Card key={testimonial.id} className="relative border-0 bg-white ring-1 ring-slate-200 transition-shadow hover:shadow-lg">
                <CardContent className="flex h-full flex-col justify-between space-y-6 p-8">
                  <div>
                    <Quote className="mb-4 h-8 w-8 text-amber-200" />
                    <div className="mb-4 flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={`${testimonial.id}-${index}`}
                          className={`h-4 w-4 ${index < Number(testimonial.rating || 0) ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"}`}
                        />
                      ))}
                    </div>
                    <p className="text-base leading-relaxed text-slate-700">
                      “{testimonial.comment || "Great food and reliable experience. Would highly recommend to anyone looking for a quality meal."}”
                    </p>
                  </div>
                  <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                      {testimonial.customer?.name?.charAt(0).toUpperCase() || "C"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{testimonial.customer?.name || "Happy Customer"}</p>
                      <p className="text-xs font-medium text-slate-500">
                        {new Date(testimonial.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="rounded-[2.5rem] bg-slate-950 px-6 py-20 text-white sm:px-12 lg:px-16 lg:py-24">
        <div className="mb-16 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-400">Simple process</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            How Foodhub Works
          </h2>
        </div>
        <div className="mx-auto max-w-5xl grid gap-12 sm:grid-cols-3 sm:gap-8">
          <div className="relative text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/20">
              <MapPin className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold">1. Discover</h3>
            <p className="mt-3 text-base leading-relaxed text-slate-400">Find the best local restaurants and explore their chef-crafted menus with ease.</p>
          </div>
          <div className="relative text-center">
            <div className="hidden sm:absolute sm:-left-[50%] sm:top-10 sm:-z-10 sm:block sm:w-full sm:border-t-2 sm:border-dashed sm:border-slate-700"></div>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
              <Sparkles className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold">2. Choose</h3>
            <p className="mt-3 text-base leading-relaxed text-slate-400">Pick your favorite meals, customize your order, and proceed to our fast checkout.</p>
          </div>
          <div className="relative text-center">
            <div className="hidden sm:absolute sm:-left-[50%] sm:top-10 sm:-z-10 sm:block sm:w-full sm:border-t-2 sm:border-dashed sm:border-slate-700"></div>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
              <ChefHat className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold">3. Enjoy</h3>
            <p className="mt-3 text-base leading-relaxed text-slate-400">Get your food prepared by verified providers and enjoy a delightful culinary experience.</p>
          </div>
        </div>
      </section>

      {/* FOR RESTAURANTS SECTION */}
      <section className="overflow-hidden rounded-[2.5rem] bg-white ring-1 ring-slate-200">
        <div className="grid lg:grid-cols-2">
          <div className="flex flex-col justify-center p-8 sm:p-16 lg:p-20">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-600">
              For Restaurants
            </p>
            <h2 
              className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl" 
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Partner with Foodhub
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              Join our platform to reach more customers, streamline your orders, and grow your culinary business with our dedicated provider tools.
            </p>
            <ul className="mt-8 space-y-4">
              <li className="flex items-center text-lg font-medium text-slate-700">
                <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                  <ShieldCheck className="h-5 w-5" /> 
                </div>
                Transparent ratings & reviews
              </li>
              <li className="flex items-center text-lg font-medium text-slate-700">
                <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                  <Clock3 className="h-5 w-5" /> 
                </div>
                Easy menu & order management
              </li>
              <li className="flex items-center text-lg font-medium text-slate-700">
                <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                  <Heart className="h-5 w-5" /> 
                </div>
                Build a loyal customer base
              </li>
            </ul>
            <div className="mt-10">
              <Button 
                asChild 
                className="h-14 rounded-full bg-slate-900 px-8 text-base font-bold text-white transition-all hover:bg-slate-800" 
              >
                <Link href="/register?role=PROVIDER">Become a Provider</Link>
              </Button>
            </div>
          </div>

          <div className="relative hidden min-h-[500px] lg:block">
            <img
              src="https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&w=1200&q=80"
              alt="Chef preparing food in a professional restaurant kitchen"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-teal-500/20 mix-blend-multiply" />
          </div>
        </div>
      </section>

      {/* BOTTOM CTA SECTION */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-amber-400 via-amber-300 to-amber-500 px-6 py-20 text-center sm:px-12 lg:px-16 lg:py-24">
        {/* Decorative background elements */}
        <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-white/20 blur-3xl"></div>
        <div className="relative z-10 mx-auto max-w-3xl">
          <h3 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Ready for your next order?
          </h3>
          <p className="mx-auto mt-6 max-w-xl text-lg font-medium text-slate-800 sm:text-xl">
            Pick your favorites, reorder in one click, and enjoy a smooth checkout experience every single time.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row sm:items-center">
            <Button asChild className="h-14 rounded-full bg-slate-950 px-10 text-base font-bold text-white transition-all hover:scale-105 hover:bg-slate-900 hover:shadow-xl">
              <Link href="/meals">Start Ordering Now</Link>
            </Button>
            <Button asChild variant="outline" className="h-14 rounded-full border-slate-950/20 bg-transparent px-10 text-base font-bold text-slate-950 transition-all hover:bg-slate-950/5">
              <Link href="/customer/favorites">Open Favorites</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}