"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MealServices } from "@/services/meal.services";
import { CategoryServices } from "@/services/category.services";
import { FavoriteServices } from "@/services/favorite.services";
import { IMeal } from "@/types/meal.types";
import { ICategory } from "@/types/category.types";
import { queryKeys } from "@/lib/query/query-keys";
import { getMealFiltersFromSearchParams } from "@/lib/query/meal-filters";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, ArrowRight, Utensils, Heart } from "lucide-react";
import PaginationControls from "@/components/shared/list/PaginationControls";
import SortControl from "@/components/shared/list/SortControl";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";

const dietOptions = [
  "VEGETARIAN",
  "VEGAN",
  "GLUTEN_FREE",
  "HALAL",
  "KETO",
  "PALEO",
  "NUT_FREE",
  "DAIRY_FREE",
];

export default function MealsPageClient() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const queryString = searchParams?.toString() || "";

  const [searchTerm, setSearchTerm] = useState(searchParams?.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get("categoryId") || "");
  const [minPrice, setMinPrice] = useState(searchParams?.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams?.get("maxPrice") || "");
  const [dietaryTag, setDietaryTag] = useState(searchParams?.get("dietaryTag") || "");
  const [sortValue, setSortValue] = useState(
    `${searchParams?.get("sortBy") || "createdAt"}:${searchParams?.get("sortOrder") || "desc"}`
  );

  useEffect(() => {
    setSearchTerm(searchParams?.get("search") || "");
    setSelectedCategory(searchParams?.get("categoryId") || "");
    setMinPrice(searchParams?.get("minPrice") || "");
    setMaxPrice(searchParams?.get("maxPrice") || "");
    setDietaryTag(searchParams?.get("dietaryTag") || "");
    setSortValue(`${searchParams?.get("sortBy") || "createdAt"}:${searchParams?.get("sortOrder") || "desc"}`);
  }, [searchParams]);

  const filters = useMemo(() => {
    const currentParams = new URLSearchParams(queryString);
    return getMealFiltersFromSearchParams(currentParams);
  }, [queryString]);

  const {
    data: mealsResponse,
    isLoading: isMealsLoading,
    isError: isMealsError,
    error: mealsError,
  } = useQuery({
    queryKey: queryKeys.meals(queryString),
    queryFn: () => MealServices.getAllMeals(filters),
    staleTime: 1000 * 60 * 10,
  });

  const {
    data: categoriesResponse,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    error: categoriesError,
  } = useQuery({
    queryKey: queryKeys.categories(),
    queryFn: () => CategoryServices.getCategories(),
    staleTime: 1000 * 60 * 60,
  });

  const meals = (mealsResponse?.data || []) as IMeal[];
  const mealsMeta = mealsResponse?.meta;
  const categories = (categoriesResponse?.data || []) as ICategory[];

  const { data: mealFavoritesResponse } = useQuery({
    queryKey: queryKeys.mealFavorites("meals-page"),
    queryFn: () => FavoriteServices.getMealFavorites({ page: 1, limit: 100 }),
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

  const toggleMealFavoriteMutation = useMutation({
    mutationFn: (mealId: string) => FavoriteServices.toggleMealFavorite(mealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-favorites"] });
      queryClient.invalidateQueries({ queryKey: ["meal-favorite-state"] });
    },
    onError: (mutationError: unknown) => {
      toast.error(getApiErrorMessage(mutationError, "Unable to update favorites."));
    },
  });

  const isLoading = isMealsLoading || isCategoriesLoading;
  const hasQueryError = isMealsError || isCategoriesError;
  const queryErrorMessage = getApiErrorMessage(
    mealsError || categoriesError,
    "Unable to load meals right now."
  );

  const handleToggleMealFavorite = (mealId: string) => {
    toggleMealFavoriteMutation.mutate(mealId);
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

  const handleApplyFilters = (event: React.FormEvent) => {
    event.preventDefault();

    const nextParams = new URLSearchParams();
    if (searchTerm.trim()) nextParams.set("search", searchTerm.trim());
    if (selectedCategory) nextParams.set("categoryId", selectedCategory);
    if (minPrice) nextParams.set("minPrice", minPrice);
    if (maxPrice) nextParams.set("maxPrice", maxPrice);
    if (dietaryTag) nextParams.set("dietaryTag", dietaryTag);
    const [sortBy, sortOrder] = sortValue.split(":");
    nextParams.set("sortBy", sortBy || "createdAt");
    nextParams.set("sortOrder", sortOrder || "desc");
    nextParams.set("page", "1");

    const nextQueryString = nextParams.toString();
    router.replace(nextQueryString ? `${pathname}?${nextQueryString}` : pathname, {
      scroll: false,
    });
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setDietaryTag("");
    setSortValue("createdAt:desc");
    router.replace(pathname, { scroll: false });
  };

  const handleSortChange = (value: string) => {
    setSortValue(value);
    const [sortBy, sortOrder] = value.split(":");
    updateParams({ sortBy, sortOrder, page: "1" });
  };

  const handlePageChange = (nextPage: number) => {
    updateParams({ page: String(nextPage) });
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans" style={{ fontFamily: "var(--font-sora)" }}>
      <div className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden bg-slate-900 border-b border-slate-800">
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-[20%] left-[10%] w-125 h-125 bg-indigo-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-60 animate-blob"></div>
          <div className="absolute bottom-[-10%] right-[20%] w-100 h-100 bg-pink-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-60 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 flex items-center justify-center opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Explore <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-indigo-400">Amazing Dishes</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-medium mb-4">
            Find the perfect meal for your cravings using our advanced filters. From healthy salads to indulgent pizzas, we have it all.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-8 -mt-8 relative z-20">
        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-xl border-slate-100 rounded-3xl bg-white/90 backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-indigo-500 to-pink-500"></div>
            <CardHeader className="pb-4 border-b border-slate-100/50 bg-white/50 backdrop-blur-sm">
              <CardTitle className="text-xl flex items-center gap-2 font-bold text-slate-800" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleApplyFilters} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Search Keyword</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="e.g. Pizza, Salad..."
                      className="pl-10 border-slate-200 focus-visible:ring-indigo-500 rounded-xl bg-slate-50"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Category</label>
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow text-slate-700"
                    value={selectedCategory}
                    onChange={(event) => setSelectedCategory(event.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Price Range ($)</label>
                  <div className="flex gap-3 items-center">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(event) => setMinPrice(event.target.value)}
                      className="border-slate-200 focus-visible:ring-indigo-500 rounded-xl bg-slate-50"
                    />
                    <span className="text-slate-400 font-bold">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(event) => setMaxPrice(event.target.value)}
                      className="border-slate-200 focus-visible:ring-indigo-500 rounded-xl bg-slate-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Dietary Focus</label>
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow text-slate-700"
                    value={dietaryTag}
                    onChange={(event) => setDietaryTag(event.target.value)}
                  >
                    <option value="">Any Diet</option>
                    {dietOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md font-bold transition-all">
                    Apply Filters
                  </Button>
                  <Button type="button" variant="outline" className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold" onClick={handleResetFilters}>
                    Reset All
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 mt-8 lg:mt-0">
          <div className="mb-4 flex justify-end">
            <SortControl
              value={sortValue}
              onValueChange={handleSortChange}
              options={[
                { label: "Newest", value: "createdAt:desc" },
                { label: "Oldest", value: "createdAt:asc" },
                { label: "Price: Low to High", value: "price:asc" },
                { label: "Price: High to Low", value: "price:desc" },
                { label: "Title: A-Z", value: "title:asc" },
                { label: "Title: Z-A", value: "title:desc" },
              ]}
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
                  <Skeleton className="h-48 w-full rounded-2xl mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/4 mb-4" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : hasQueryError ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm col-span-full">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Utensils className="w-10 h-10 text-rose-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>Failed to load meals</h3>
              <p className="text-slate-500 text-lg max-w-md mx-auto">{queryErrorMessage}</p>
            </div>
          ) : meals.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm col-span-full">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Utensils className="w-10 h-10 text-indigo-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>No meals found</h3>
              <p className="text-slate-500 text-lg max-w-md mx-auto">Try adjusting your filters or search term to discover exactly what you're craving.</p>
              <Button onClick={handleResetFilters} variant="outline" className="mt-6 rounded-full font-bold">Clear All Filters</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {meals.map((meal) => (
                <Card key={meal.id} className="overflow-hidden py-0 border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group rounded-3xl bg-white flex flex-col h-full">
                  {meal.image ? (
                    <Link href={`/meals/${meal.id}`} className="block relative h-48 overflow-hidden">
                      <img
                        src={meal.image}
                        alt={meal.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full font-bold text-slate-900 text-sm shadow-sm flex items-center">
                        <span className="text-indigo-600 mr-0.5">$</span>{meal.price.toFixed(2)}
                      </div>
                      {meal.dietaryTag && meal.dietaryTag !== "NONE" && (
                        <Badge className="absolute top-3 left-3 bg-emerald-500/90 hover:bg-emerald-600 text-white backdrop-blur-sm border-none uppercase text-[10px] tracking-wider font-bold shadow-sm">
                          {meal.dietaryTag.replace("_", " ")}
                        </Badge>
                      )}
                    </Link>
                  ) : (
                    <div className="p-6 pb-0 flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-slate-900 line-clamp-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                          <Link href={`/meals/${meal.id}`} className="hover:text-indigo-600 transition-colors">
                            {meal.title}
                          </Link>
                        </CardTitle>
                      </div>
                      <div className="font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-full text-sm shrink-0 flex items-center">
                        <span className="text-indigo-600 mr-0.5">$</span>{meal.price.toFixed(2)}
                      </div>
                    </div>
                  )}

                  <CardHeader className="\ flex-1">
                    {meal.image && (
                      <CardTitle className="text-xl font-bold text-slate-900 line-clamp-1" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                        <Link href={`/meals/${meal.id}`} className="hover:text-indigo-600 transition-colors">
                          {meal.title}
                        </Link>
                      </CardTitle>
                    )}
                    <CardDescription className="line-clamp-2 mt-1.5 text-slate-500 text-sm leading-relaxed">
                      {meal.description || "A perfectly prepared dish right to your door."}
                    </CardDescription>

                    {!meal.image && meal.dietaryTag && meal.dietaryTag !== "NONE" && (
                      <Badge variant="secondary" className="mt-4 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 w-fit text-xs uppercase tracking-wider font-bold shadow-sm">
                        {meal.dietaryTag.replace("_", " ")}
                      </Badge>
                    )}
                  </CardHeader>

                  <CardContent className="px-5 pb-5 pt-4 mt-auto bg-white border-t border-slate-50 flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-slate-400 flex items-center min-w-0">
                        <span>By</span>
                        <span className="font-bold text-slate-700 ml-1 truncate">{meal.provider?.restaurantName || "Unknown Chef"}</span>
                      </p>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 shrink-0"
                        onClick={() => handleToggleMealFavorite(meal.id)}
                        aria-label="Toggle favorite meal"
                      >
                        <Heart
                          className={`h-4 w-4 ${favoriteMealIds.has(meal.id) ? "fill-red-500 text-red-500" : "text-slate-500"}`}
                        />
                      </Button>
                    </div>
                    <Button asChild className="w-full bg-slate-100 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-xl shadow-none transition-colors duration-300 font-bold group/btn">
                      <Link href={meal.provider?.id ? `/restaurant/${meal.provider.id}` : "/restaurants"}>
                        View Restaurant <ArrowRight className="ml-2 w-4 h-4 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
                ))}
              </div>
              <PaginationControls meta={mealsMeta} onPageChange={handlePageChange} isLoading={isLoading} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
