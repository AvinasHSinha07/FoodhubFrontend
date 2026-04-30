"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FavoriteServices } from "@/services/favorite.services";
import { queryKeys } from "@/lib/query/query-keys";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCart } from "@/providers/CartProvider";

export default function CustomerFavoritesPageClient() {
  const [activeTab, setActiveTab] = useState<"meals" | "restaurants">("meals");
  const queryClient = useQueryClient();
  const { addToCart } = useCart();

  const mealQueryString = "page=1&limit=50";
  const providerQueryString = "page=1&limit=50";

  const { data: mealFavoritesResponse, isLoading: isMealFavoritesLoading } = useQuery({
    queryKey: queryKeys.mealFavorites(mealQueryString),
    queryFn: () => FavoriteServices.getMealFavorites({ page: 1, limit: 50 }),
    staleTime: 1000 * 60,
  });

  const { data: providerFavoritesResponse, isLoading: isProviderFavoritesLoading } = useQuery({
    queryKey: queryKeys.providerFavorites(providerQueryString),
    queryFn: () => FavoriteServices.getProviderFavorites({ page: 1, limit: 50 }),
    staleTime: 1000 * 60,
  });

  const mealFavorites = mealFavoritesResponse?.data || [];
  const providerFavorites = providerFavoritesResponse?.data || [];

  const isLoading = isMealFavoritesLoading || isProviderFavoritesLoading;

  const groupedMealFavorites = useMemo(() => {
    return mealFavorites.map((favorite: any) => ({
      id: favorite.id,
      meal: favorite.meal,
      provider: favorite.meal?.provider,
    }));
  }, [mealFavorites]);

  const handleToggleMealFavorite = async (mealId: string) => {
    try {
      await FavoriteServices.toggleMealFavorite(mealId);
      await queryClient.invalidateQueries({ queryKey: queryKeys.mealFavorites(mealQueryString) });
      toast.success("Meal favorites updated.");
    } catch {
      toast.error("Failed to update meal favorites.");
    }
  };

  const handleToggleProviderFavorite = async (providerId: string) => {
    try {
      await FavoriteServices.toggleProviderFavorite(providerId);
      await queryClient.invalidateQueries({ queryKey: queryKeys.providerFavorites(providerQueryString) });
      toast.success("Restaurant favorites updated.");
    } catch {
      toast.error("Failed to update restaurant favorites.");
    }
  };

  const handleQuickAddToCart = (favorite: any) => {
    const meal = favorite.meal;
    const provider = favorite.provider;

    if (!meal || !provider) {
      toast.error("Meal provider data is missing.");
      return;
    }

    const result = addToCart(meal, provider);

    if (result === "provider_mismatch") {
      const confirmed = window.confirm(
        "Your cart has items from another restaurant. Replace cart and add this meal?"
      );

      if (!confirmed) {
        return;
      }

      addToCart(meal, provider, 1, { forceReplace: true });
    }

    toast.success("Added to cart.");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">My Favorites</h1>
        <p className="text-slate-500 font-medium mt-1">Your saved meals and restaurants.</p>
      </div>

      <div className="flex gap-3 bg-muted/30 p-2 rounded-[20px] w-max border border-border/50">
        <Button
          variant={activeTab === "meals" ? "default" : "ghost"}
          className={`h-12 px-6 rounded-[14px] font-bold transition-all ${activeTab === 'meals' ? 'bg-[#ED6A5E] hover:bg-[#FF8E72] text-white shadow-md' : 'text-slate-500 hover:text-foreground'}`}
          onClick={() => setActiveTab("meals")}
        >
          Meals ({groupedMealFavorites.length})
        </Button>
        <Button
          variant={activeTab === "restaurants" ? "default" : "ghost"}
          className={`h-12 px-6 rounded-[14px] font-bold transition-all ${activeTab === 'restaurants' ? 'bg-[#377771] dark:bg-[#4CE0B3] text-white dark:text-emerald-950 shadow-md' : 'text-slate-500 hover:text-foreground'}`}
          onClick={() => setActiveTab("restaurants")}
        >
          Restaurants ({providerFavorites.length})
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-56 w-full rounded-[24px]" />
          <Skeleton className="h-56 w-full rounded-[24px]" />
          <Skeleton className="h-56 w-full rounded-[24px]" />
        </div>
      ) : activeTab === "meals" ? (
        groupedMealFavorites.length === 0 ? (
          <Card className="rounded-[24px] border-border/50 bg-background shadow-sm">
            <CardContent className="py-24 text-center">
              <p className="text-2xl font-extrabold text-foreground mb-2">No Favorite Meals</p>
              <p className="text-slate-500 font-medium text-sm">You haven't saved any meals yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedMealFavorites.map((favorite) => (
              <Card key={favorite.id} className="overflow-hidden rounded-[24px] border-border/50 bg-background shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                <CardHeader className="pb-3 border-b border-border/20 bg-muted/20 pt-6">
                  <CardTitle className="text-xl font-extrabold line-clamp-1 group-hover:text-[#ED6A5E] transition-colors">{favorite.meal?.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col flex-1">
                  <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-3">{favorite.meal?.description}</p>
                  <p className="text-2xl font-extrabold text-[#377771] dark:text-[#4CE0B3] mt-auto">${favorite.meal?.price?.toFixed(2)}</p>
                  
                  <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-border/50">
                    <Button onClick={() => handleQuickAddToCart(favorite)} className="h-11 rounded-[12px] bg-[#ED6A5E] hover:bg-[#FF8E72] text-white font-bold w-full shadow-sm hover:-translate-y-0.5 transition-all">
                      Quick Add
                    </Button>
                    <Button variant="outline" asChild className="h-11 rounded-[12px] font-bold border-border/50 hover:bg-muted text-foreground w-full">
                      <Link href={`/restaurant/${favorite.provider?.id}`}>Menu</Link>
                    </Button>
                    <Button variant="ghost" onClick={() => handleToggleMealFavorite(favorite.meal?.id)} className="col-span-2 h-10 rounded-[12px] font-bold text-destructive hover:text-destructive hover:bg-destructive/10">
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : providerFavorites.length === 0 ? (
        <Card className="rounded-[24px] border-border/50 bg-background shadow-sm">
          <CardContent className="py-24 text-center">
            <p className="text-2xl font-extrabold text-foreground mb-2">No Favorite Restaurants</p>
            <p className="text-slate-500 font-medium text-sm">You haven't saved any restaurants yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providerFavorites.map((favorite: any) => (
            <Card key={favorite.id} className="rounded-[24px] border-border/50 bg-background shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              <CardContent className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <p className="text-xl font-extrabold line-clamp-2 group-hover:text-[#377771] dark:group-hover:text-[#4CE0B3] transition-colors">{favorite.provider?.restaurantName}</p>
                </div>
                
                <p className="text-sm text-slate-500 font-medium line-clamp-3 flex-1">{favorite.provider?.description || "No description provided."}</p>
                
                {favorite.provider?.cuisineType ? (
                  <div className="mt-4">
                    <Badge className="bg-[#377771]/10 text-[#377771] dark:bg-[#4CE0B3]/10 dark:text-[#4CE0B3] hover:bg-[#377771]/20 border-none font-bold px-3 py-1">{favorite.provider.cuisineType}</Badge>
                  </div>
                ) : null}
                
                <div className="grid grid-cols-1 gap-3 mt-6 pt-4 border-t border-border/50">
                  <Button asChild className="h-11 rounded-[12px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-[#377771] dark:hover:bg-[#4CE0B3] dark:hover:text-emerald-950 font-bold w-full transition-all">
                    <Link href={`/restaurant/${favorite.provider?.id}`}>Open Menu</Link>
                  </Button>
                  <Button variant="ghost" onClick={() => handleToggleProviderFavorite(favorite.provider?.id)} className="h-10 rounded-[12px] font-bold text-destructive hover:text-destructive hover:bg-destructive/10">
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
