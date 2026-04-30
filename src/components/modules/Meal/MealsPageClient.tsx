"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MealServices } from "@/services/meal.services";
import { CategoryServices } from "@/services/category.services";
import { FavoriteServices } from "@/services/favorite.services";
import { SearchServices } from "@/services/search.services";
import { IMeal } from "@/types/meal.types";
import { ICategory } from "@/types/category.types";
import { queryKeys } from "@/lib/query/query-keys";
import { getMealFiltersFromSearchParams } from "@/lib/query/meal-filters";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, ArrowRight, Utensils, Heart, Sparkles, Loader2 } from "lucide-react";
import PaginationControls from "@/components/shared/list/PaginationControls";
import SortControl from "@/components/shared/list/SortControl";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import { motion, AnimatePresence } from "framer-motion";

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

  // ── AI Search Suggestions State ──────────────────────────────────────────────
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(searchParams?.get("search") || "");
    setSelectedCategory(searchParams?.get("categoryId") || "");
    setMinPrice(searchParams?.get("minPrice") || "");
    setMaxPrice(searchParams?.get("maxPrice") || "");
    setDietaryTag(searchParams?.get("dietaryTag") || "");
    setSortValue(`${searchParams?.get("sortBy") || "createdAt"}:${searchParams?.get("sortOrder") || "desc"}`);
  }, [searchParams]);

  // Debounced AI suggestions fetch
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSuggestions([]);
      setIsSuggestionsOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsFetchingSuggestions(true);
      const results = await SearchServices.getSuggestions(searchTerm);
      setSuggestions(results);
      setIsSuggestionsOpen(results.length > 0);
      setIsFetchingSuggestions(false);
    }, 420);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setIsSuggestionsOpen(false);
    // Immediately apply as a search
    const nextParams = new URLSearchParams(searchParams?.toString());
    nextParams.set("search", suggestion);
    nextParams.set("page", "1");
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  };

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
    <div className="bg-background min-h-screen pb-20 font-sans">
      <div className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden bg-[#0F172A] border-b border-white/5">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute -top-40 left-10 w-[500px] h-[500px] bg-[#ED6A5E]/20 rounded-full blur-[100px] opacity-60"></div>
          <div className="absolute -bottom-40 right-20 w-[500px] h-[500px] bg-[#377771]/30 rounded-full blur-[100px] opacity-60"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ED6A5E] to-[#FFAF87]">Amazing Dishes</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-medium mb-4">
            Find the perfect meal for your cravings using our advanced filters. From healthy salads to indulgent pizzas, we have it all.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-8 -mt-8 relative z-20">
        <div className="lg:col-span-1">
          <Card className="sticky top-28 shadow-lg border-border/50 rounded-[24px] bg-background/80 backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ED6A5E] to-[#FFAF87]"></div>
            <CardHeader className="pb-4 border-b border-border/40 bg-background/50">
              <CardTitle className="text-xl flex items-center gap-2 font-extrabold text-foreground">
                <SlidersHorizontal className="w-5 h-5 text-[#ED6A5E]" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleApplyFilters} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    Search Keyword
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#ED6A5E]/10 text-[#ED6A5E] uppercase tracking-wider">
                      <Sparkles className="w-2.5 h-2.5" /> AI
                    </span>
                  </label>
                  <div className="relative" ref={searchWrapperRef}>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 z-10" />
                      <Input
                        id="meals-search-input"
                        placeholder="e.g. Pizza, Vegan Bowl..."
                        className="pl-10 pr-9 border-slate-200 focus-visible:ring-[#ED6A5E]/40 rounded-xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => suggestions.length > 0 && setIsSuggestionsOpen(true)}
                        autoComplete="off"
                      />
                      {isFetchingSuggestions && (
                        <Loader2 className="absolute right-3 top-3 h-4 w-4 text-[#ED6A5E] animate-spin" />
                      )}
                    </div>

                    {/* AI Suggestions Dropdown */}
                    <AnimatePresence>
                      {isSuggestionsOpen && suggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.98 }}
                          transition={{ duration: 0.18 }}
                          className="absolute top-full left-0 right-0 mt-2 z-50 bg-background border border-border/60 rounded-[16px] shadow-[0_16px_40px_rgba(0,0,0,0.12)] overflow-hidden"
                        >
                          <div className="px-3 py-2 border-b border-border/40 flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-[#ED6A5E]" />
                            <span className="text-[10px] font-bold text-[#ED6A5E] uppercase tracking-widest">AI Suggestions</span>
                          </div>
                          <ul className="py-1">
                            {suggestions.map((s, i) => (
                              <motion.li
                                key={s}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleSuggestionClick(s)}
                                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-foreground hover:bg-[#ED6A5E]/8 hover:text-[#ED6A5E] transition-colors flex items-center gap-2.5 group"
                                >
                                  <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#ED6A5E] transition-colors flex-shrink-0" />
                                  {s}
                                </button>
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
                  <Button type="submit" className="w-full bg-[#ED6A5E] hover:bg-[#FF8E72] text-white rounded-[14px] shadow-lg shadow-[#ED6A5E]/20 font-bold transition-all">
                    Apply Filters
                  </Button>
                  <Button type="button" variant="outline" className="w-full border-border/50 text-foreground hover:bg-muted rounded-[14px] font-bold" onClick={handleResetFilters}>
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
              <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Utensils className="w-10 h-10 text-destructive" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Failed to load meals</h3>
              <p className="text-slate-500 text-lg max-w-md mx-auto">{queryErrorMessage}</p>
            </div>
          ) : meals.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm col-span-full">
              <div className="w-20 h-20 bg-[#377771]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Utensils className="w-10 h-10 text-[#377771]" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">No meals found</h3>
              <p className="text-slate-500 text-lg max-w-md mx-auto">Try adjusting your filters or search term to discover exactly what you're craving.</p>
              <Button onClick={handleResetFilters} variant="outline" className="mt-6 rounded-full font-bold">Clear All Filters</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {meals.map((meal) => (
                <Card key={meal.id} className="overflow-hidden py-0 border-border/50 shadow-sm hover:shadow-[0_20px_40px_rgba(55,119,113,0.08)] hover:-translate-y-1.5 transition-all duration-500 group rounded-[24px] bg-background flex flex-col h-full">
                  {meal.image ? (
                    <Link href={`/meals/${meal.id}`} className="block relative pt-[70%] overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={meal.image}
                        alt={meal.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full font-extrabold text-[#377771] dark:text-[#4CE0B3] text-sm shadow-sm flex items-center">
                        <span className="mr-0.5">$</span>{meal.price.toFixed(2)}
                      </div>
                      {meal.dietaryTag && meal.dietaryTag !== "NONE" && (
                        <Badge className="absolute top-3 left-3 bg-[#4CE0B3]/90 hover:bg-[#4CE0B3] text-emerald-900 backdrop-blur-sm border-none uppercase text-[10px] tracking-wider font-bold shadow-sm">
                          {meal.dietaryTag.replace("_", " ")}
                        </Badge>
                      )}
                    </Link>
                  ) : (
                    <div className="p-6 pb-0 flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-extrabold text-foreground line-clamp-2">
                          <Link href={`/meals/${meal.id}`} className="hover:text-[#ED6A5E] transition-colors">
                            {meal.title}
                          </Link>
                        </CardTitle>
                      </div>
                      <div className="font-extrabold text-[#377771] dark:text-[#4CE0B3] bg-muted px-3 py-1.5 rounded-full text-sm shrink-0 flex items-center">
                        <span className="mr-0.5">$</span>{meal.price.toFixed(2)}
                      </div>
                    </div>
                  )}

                  <CardHeader className="flex-1">
                    {meal.image && (
                      <CardTitle className="text-xl font-extrabold text-foreground line-clamp-1">
                        <Link href={`/meals/${meal.id}`} className="hover:text-[#ED6A5E] transition-colors">
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

                  <CardContent className="px-5 pb-5 pt-4 mt-auto bg-background border-t border-border/20 flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-slate-400 flex items-center min-w-0">
                        <span>By</span>
                        <span className="font-bold text-foreground ml-1 truncate">{meal.provider?.restaurantName || "Unknown Chef"}</span>
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
                          className={`h-4 w-4 transition-colors ${favoriteMealIds.has(meal.id) ? "fill-[#ED6A5E] text-[#ED6A5E]" : "text-slate-400 hover:text-[#ED6A5E]"}`}
                        />
                      </Button>
                    </div>
                    <Button asChild className="w-full bg-muted text-[#377771] dark:text-white hover:bg-[#ED6A5E] hover:text-white rounded-[14px] shadow-none transition-all duration-300 font-bold group/btn">
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
