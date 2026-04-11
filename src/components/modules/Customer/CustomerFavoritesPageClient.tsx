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
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Favorites</h1>
          <p className="text-gray-500">Your saved meals and restaurants.</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={activeTab === "meals" ? "default" : "outline"}
          onClick={() => setActiveTab("meals")}
        >
          Meals ({groupedMealFavorites.length})
        </Button>
        <Button
          variant={activeTab === "restaurants" ? "default" : "outline"}
          onClick={() => setActiveTab("restaurants")}
        >
          Restaurants ({providerFavorites.length})
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : activeTab === "meals" ? (
        groupedMealFavorites.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-slate-500">
              You have no favorite meals yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedMealFavorites.map((favorite) => (
              <Card key={favorite.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-1">{favorite.meal?.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500 line-clamp-2">{favorite.meal?.description}</p>
                  <p className="text-sm font-semibold mt-2">${favorite.meal?.price?.toFixed(2)}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button size="sm" onClick={() => handleQuickAddToCart(favorite)}>
                      Quick Add
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/restaurant/${favorite.provider?.id}`}>View Restaurant</Link>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleToggleMealFavorite(favorite.meal?.id)}>
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : providerFavorites.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-slate-500">
            You have no favorite restaurants yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providerFavorites.map((favorite: any) => (
            <Card key={favorite.id}>
              <CardContent className="pt-5">
                <p className="text-lg font-semibold">{favorite.provider?.restaurantName}</p>
                <p className="text-sm text-slate-500 line-clamp-2">{favorite.provider?.description || "No description provided."}</p>
                {favorite.provider?.cuisineType ? (
                  <Badge className="mt-3" variant="secondary">{favorite.provider.cuisineType}</Badge>
                ) : null}
                <div className="flex gap-2 mt-4">
                  <Button size="sm" asChild>
                    <Link href={`/restaurant/${favorite.provider?.id}`}>Open Menu</Link>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleToggleProviderFavorite(favorite.provider?.id)}>
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
