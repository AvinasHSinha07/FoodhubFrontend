"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProviderProfileServices } from "@/services/providerProfile.services";
import { FavoriteServices } from "@/services/favorite.services";
import { IProviderProfile } from "@/types/user.types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/CartProvider";
import { ShoppingCart, Plus, Minus, ArrowLeft, Utensils, MapPin, Star, ArrowRight, Heart } from "lucide-react";
import { IMeal } from "@/types/meal.types";
import { queryKeys } from "@/lib/query/query-keys";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

type RestaurantMenuPageClientProps = {
  providerId: string;
};

export default function RestaurantMenuPageClient({ providerId }: RestaurantMenuPageClientProps) {
  const queryClient = useQueryClient();
  const { items, addToCart, updateQuantity, totalPrice, clearCart, providerId: cartProviderId } = useCart();
  const [isReplaceCartModalOpen, setIsReplaceCartModalOpen] = useState(false);
  const [pendingMeal, setPendingMeal] = useState<IMeal | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.provider(providerId),
    queryFn: () => ProviderProfileServices.getProviderById(providerId),
    staleTime: 1000 * 60 * 10,
  });

  const provider = (data?.data || null) as IProviderProfile | null;

  const { data: mealFavoritesResponse } = useQuery({
    queryKey: queryKeys.mealFavorites(`restaurant-${providerId}`),
    queryFn: () => FavoriteServices.getMealFavorites({ page: 1, limit: 100 }),
    staleTime: 1000 * 60,
    retry: false,
  });

  const { data: providerFavoriteStateResponse } = useQuery({
    queryKey: queryKeys.providerFavoriteState(providerId),
    queryFn: () => FavoriteServices.getProviderFavoriteState(providerId),
    staleTime: 1000 * 60,
    retry: false,
  });

  const favoriteMealIds = new Set(
    ((mealFavoritesResponse?.data || []) as any[])
      .map((favorite) => favorite.meal?.id)
      .filter(Boolean)
  );
  const isProviderFavorited = providerFavoriteStateResponse?.data?.favorited || false;

  const toggleMealFavoriteMutation = useMutation({
    mutationFn: (mealId: string) => FavoriteServices.toggleMealFavorite(mealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-favorites"] });
      queryClient.invalidateQueries({ queryKey: ["meal-favorite-state"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Unable to update favorites.");
    },
  });

  const toggleProviderFavoriteMutation = useMutation({
    mutationFn: () => FavoriteServices.toggleProviderFavorite(providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-favorites"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.providerFavoriteState(providerId) });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Unable to update favorites.");
    },
  });

  useEffect(() => {
    if (!isLoading && !provider && cartProviderId === providerId) {
      clearCart();
    }
  }, [isLoading, provider, cartProviderId, providerId, clearCart]);

  const getCartQuantity = (mealId: string) => {
    return items.find((item) => item.meal.id === mealId)?.quantity || 0;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-20 px-4 mt-20">
        <Skeleton className="h-[400px] w-full mb-12 rounded-3xl" />
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 pt-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-slate-800" style={{ fontFamily: "var(--font-space-grotesk)" }}>Restaurant not found</h2>
        <Button asChild className="rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-md">
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
        </Button>
      </div>
    );
  }

  const availableMeals = provider.meals?.filter((meal: any) => meal.isAvailable) || [];
  const reviews = provider?.meals?.flatMap((meal: any) => meal.reviews || []) || [];
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : "New";
  const reviewCount = reviews.length;
  const bannerImage =
    provider.bannerImage ||
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1600";

  const handleAddToOrder = (meal: IMeal) => {
    const result = addToCart(meal, provider);

    if (result === "provider_mismatch") {
      setPendingMeal(meal);
      setIsReplaceCartModalOpen(true);
    }
  };

  const handleConfirmReplaceCart = () => {
    if (!pendingMeal) {
      return;
    }

    addToCart(pendingMeal, provider, 1, { forceReplace: true });
    setPendingMeal(null);
    setIsReplaceCartModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans" style={{ fontFamily: "var(--font-sora)" }}>
      <div className="relative pt-24 pb-12 lg:pt-32 lg:pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-[-10%] w-96 h-96 bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute bottom-0 left-[-10%] w-96 h-96 bg-pink-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-slate-50/80 backdrop-blur-sm"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link href="/restaurants" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to all restaurants
          </Link>

          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white border border-slate-100">
            <div
              className="h-48 sm:h-64 lg:h-80 w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${bannerImage})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent" />
            </div>

            <div className="relative px-6 pb-6 sm:px-10 sm:pb-10 -mt-16 sm:-mt-20 flex flex-col sm:flex-row gap-6 items-end">
              {provider.logo ? (
                <img src={provider.logo} alt="Logo" className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-xl object-cover bg-white" />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-xl bg-indigo-100 flex items-center justify-center">
                  <Utensils className="h-12 w-12 text-indigo-400" />
                </div>
              )}

              <div className="flex-1 pb-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  {provider.restaurantName}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="bg-white/20 text-white hover:bg-white/30 border-none"
                    onClick={() => toggleProviderFavoriteMutation.mutate()}
                  >
                    <Heart className={`mr-2 h-4 w-4 ${isProviderFavorited ? "fill-red-500 text-red-500" : "text-white"}`} />
                    {isProviderFavorited ? "Saved" : "Save"}
                  </Button>
                  {provider.cuisineType && (
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md px-3 py-1 text-sm font-medium transition-all">
                      <Utensils className="w-3 h-3 mr-1.5 inline-block" />
                      {provider.cuisineType}
                    </Badge>
                  )}
                  <div className="flex items-center text-slate-200 text-sm font-medium">
                    <MapPin className="w-4 h-4 mr-1 text-pink-400" />
                    {provider.address || "No address provided"}
                  </div>
                  <div className="flex items-center text-yellow-400 text-sm font-bold bg-gray-900/40 px-2 py-0.5 rounded backdrop-blur-sm">
                    <Star className="w-3.5 h-3.5 fill-current mr-1" />
                    {averageRating} {reviewCount > 0 && <span className="text-slate-200 font-normal ml-1">({reviewCount})</span>}
                  </div>
                  <Badge
                    className={
                      provider.isOpenNow
                        ? "bg-emerald-500/90 text-white border-none"
                        : "bg-rose-500/90 text-white border-none"
                    }
                  >
                    {provider.isOpenNow ? "Open Now" : provider.nextOpenAt ? `Opens ${provider.nextOpenAt}` : "Closed"}
                  </Badge>
                  <Badge className="bg-white/20 text-white border-none">
                    Prep ~ {provider.estimatedReadyInMinutes || provider.preparationTimeMinutes || 30} min
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="col-span-1 lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Featured Menu
            </h2>
          </div>

          {availableMeals.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
              <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium text-lg">This restaurant has no available items right now.</p>
              <p className="text-slate-400 text-sm mt-2">Check back later for delicious updates!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableMeals.map((meal: IMeal) => {
                const qty = getCartQuantity(meal.id);
                return (
                  <Card key={meal.id} className="group overflow-hidden border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl bg-white flex flex-col h-full">
                    {meal.image ? (
                      <div className="h-48 w-full overflow-hidden relative">
                        <img src={meal.image} alt={meal.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full font-bold text-slate-900 text-sm shadow-sm flex items-center">
                          <span className="text-indigo-600 mr-0.5">$</span>{meal.price.toFixed(2)}
                        </div>
                        {meal.dietaryTag && meal.dietaryTag !== "NONE" && (
                          <Badge className="absolute top-4 left-4 bg-emerald-500/90 hover:bg-emerald-600 text-white backdrop-blur-sm border-none uppercase text-[10px] tracking-wider font-bold">
                            {meal.dietaryTag.replace("_", " ")}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="p-6 pb-0 flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold text-slate-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>{meal.title}</CardTitle>
                        </div>
                        <div className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-full text-sm shrink-0 flex items-center">
                          <span className="text-indigo-600 mr-0.5">$</span>{meal.price.toFixed(2)}
                        </div>
                      </div>
                    )}

                    <CardHeader className="flex-1">
                      {meal.image && (
                        <CardTitle className="text-xl font-bold text-slate-900 line-clamp-1 mb-1.5" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                          {meal.title}
                        </CardTitle>
                      )}
                      <CardDescription className="line-clamp-2 text-slate-500 text-sm leading-relaxed">
                        {meal.description || "A delicious meal prepared fresh to order."}
                      </CardDescription>
                      {!meal.image && meal.dietaryTag && meal.dietaryTag !== "NONE" && (
                        <Badge variant="secondary" className="mt-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 w-fit text-xs uppercase tracking-wider font-bold shadow-sm inline-block">
                          {meal.dietaryTag.replace("_", " ")}
                        </Badge>
                      )}
                    </CardHeader>

                    <div className="p-5 pt-4 border-t border-slate-50 mt-auto">
                      <div className="mb-3 flex justify-end">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => toggleMealFavoriteMutation.mutate(meal.id)}
                          aria-label="Toggle favorite meal"
                        >
                          <Heart
                            className={`h-4 w-4 ${favoriteMealIds.has(meal.id) ? "fill-red-500 text-red-500" : "text-slate-500"}`}
                          />
                        </Button>
                      </div>
                      {qty === 0 ? (
                        <Button
                          className="w-full rounded-2xl h-12 bg-slate-900 hover:bg-indigo-600 text-white transition-colors duration-300 font-bold shadow-sm group-hover:shadow-md"
                          onClick={() => handleAddToOrder(meal)}
                        >
                          <Plus className="mr-2 h-5 w-5" /> Add to Order
                        </Button>
                      ) : (
                        <div className="flex items-center justify-between bg-indigo-50 rounded-2xl p-2 border border-indigo-100 h-12">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl bg-white shadow-sm hover:bg-slate-50 text-indigo-600" onClick={() => updateQuantity(meal.id, qty - 1)}>
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-black text-indigo-900 w-10 text-center text-lg">{qty}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl bg-indigo-600 shadow-sm hover:bg-indigo-700 text-white" onClick={() => handleAddToOrder(meal)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="col-span-1 lg:col-span-1">
          <div className="sticky top-24">
            <Card className="border-none shadow-xl rounded-3xl bg-white overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-indigo-500"></div>
              <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50 pt-6 px-6">
                <CardTitle className="flex items-center justify-between text-xl font-extrabold text-slate-800" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  <span className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-indigo-500" /> Your Order</span>
                  {items.length > 0 && <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none font-bold shadow-sm">{items.length} items</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {items.length === 0 ? (
                  <div className="p-10 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-5 border border-slate-100">
                      <ShoppingCart className="h-10 w-10 text-slate-300" />
                    </div>
                    <p className="font-bold text-slate-800 mb-1 text-lg">Your cart is empty</p>
                    <p className="text-sm text-slate-500 font-medium">Add some delicious meals to get started.</p>
                  </div>
                ) : (
                  <div className="flex flex-col h-full max-h-[calc(100vh-250px)]">
                    <div className="overflow-y-auto p-6 space-y-5 custom-scrollbar">
                      {items.map((item) => (
                        <div key={item.meal.id} className="flex gap-4 items-start group">
                          <div className="h-14 w-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 shadow-sm relative">
                            {item.meal.image ? (
                              <img src={item.meal.image} alt={item.meal.title} className="h-full w-full object-cover" />
                            ) : (
                              <Utensils className="h-6 w-6 m-4 text-slate-400" />
                            )}
                            <div className="absolute -top-1 -right-1 bg-indigo-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold border-2 border-white shadow-sm">
                              {item.quantity}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <h4 className="font-bold text-slate-800 text-sm truncate leading-tight group-hover:text-indigo-600 transition-colors">{item.meal.title}</h4>
                            <p className="text-slate-500 text-xs mt-1 font-medium">${item.meal.price.toFixed(2)} each</p>
                          </div>
                          <div className="font-extrabold text-slate-800 text-sm pt-0.5 mt-auto">
                            ${(item.meal.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-100 mt-auto">
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm text-slate-500 font-medium">
                          <span>Subtotal</span>
                          <span className="text-slate-800 font-bold">${totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-500 font-medium">
                          <span>Delivery</span>
                          <span className="text-emerald-500 font-bold">Free</span>
                        </div>
                        <div className="pt-3 border-t border-slate-200 mt-3 flex justify-between items-center">
                          <span className="font-extrabold text-slate-800 text-lg">Total (USD)</span>
                          <span className="text-2xl font-black text-indigo-600" style={{ fontFamily: "var(--font-space-grotesk)" }}>${totalPrice.toFixed(2)}</span>
                        </div>
                      </div>

                      <Button className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 group" asChild>
                        <Link href="/checkout" className="flex items-center justify-center">
                          Proceed to Checkout <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-8" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Customer Reviews
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review: any, idx: number) => (
                <div key={review.id || idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4 mb-4">
                    {review.customer?.image ? (
                      <img src={review.customer.image} alt={review.customer?.name} className="w-12 h-12 rounded-full object-cover shadow-sm bg-white" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg shadow-sm">
                        {review.customer?.name?.charAt(0) || "U"}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-900">{review.customer?.name || "Anonymous User"}</h4>
                      <div className="flex items-center text-yellow-500 mt-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star key={index} className={`w-4 h-4 ${index < review.rating ? "fill-current" : "text-slate-300"}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-slate-600 text-sm leading-relaxed mb-3">"{review.comment}"</p>
                  )}
                  {review.createdAt && (
                    <p className="text-slate-400 text-xs font-medium">
                      {new Date(review.createdAt).toLocaleDateString(undefined, {
                        year: "numeric", month: "long", day: "numeric"
                      })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Dialog
        open={isReplaceCartModalOpen}
        onOpenChange={(open) => {
          setIsReplaceCartModalOpen(open);
          if (!open) {
            setPendingMeal(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace Current Cart?</DialogTitle>
            <DialogDescription>
              Adding this item will clear your current cart from another restaurant. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReplaceCartModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmReplaceCart}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
