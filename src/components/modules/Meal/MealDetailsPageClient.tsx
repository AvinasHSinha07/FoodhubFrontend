"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { MealServices } from "@/services/meal.services";
import { ReviewServices } from "@/services/review.services";
import { queryKeys } from "@/lib/query/query-keys";
import { IMeal } from "@/types/meal.types";
import { IProviderProfile } from "@/types/user.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useCart } from "@/providers/CartProvider";
import { toast } from "sonner";

type ReviewItem = {
  id: string;
  rating: number;
  comment?: string | null;
  customer?: {
    name?: string;
  };
};

type MealDetailsPageClientProps = {
  mealId: string;
};

export default function MealDetailsPageClient({ mealId }: MealDetailsPageClientProps) {
  const router = useRouter();
  const { addToCart, clearCart, items, totalItems, totalPrice, providerId: cartProviderId, providerInfo } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isReplaceCartModalOpen, setIsReplaceCartModalOpen] = useState(false);
  const [pendingQty, setPendingQty] = useState(1);

  const { data: mealResponse, isLoading: isMealLoading } = useQuery({
    queryKey: queryKeys.meal(mealId),
    queryFn: () => MealServices.getMealById(mealId),
    staleTime: 1000 * 60 * 10,
  });

  const { data: reviewResponse, isLoading: isReviewsLoading } = useQuery({
    queryKey: queryKeys.mealReviews(mealId),
    queryFn: () => ReviewServices.getMealReviews(mealId),
    staleTime: 1000 * 60 * 5,
  });

  const meal = mealResponse?.data as IMeal | undefined;
  const reviews = (reviewResponse?.data || []) as ReviewItem[];

  if (isMealLoading || isReviewsLoading) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4 space-y-6">
        <Skeleton className="h-96 w-full rounded-xl" />
        <Skeleton className="h-10 w-60" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!meal) {
    return (
      <Card className="max-w-3xl mx-auto mt-10 p-8 text-center">
        <h2 className="text-xl font-semibold">Meal not found</h2>
        <p className="text-gray-500 mt-2">The requested meal may not exist.</p>
        <Button asChild className="mt-6">
          <Link href="/meals">Back to Meals</Link>
        </Button>
      </Card>
    );
  }

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : null;

  const hasForeignProviderCart =
    Boolean(cartProviderId) && Boolean(meal.providerId) && cartProviderId !== meal.providerId;

  const handleAddToCart = (qty = quantity, forceReplace = false) => {
    if (!meal.provider) {
      toast.error("Provider info is missing for this meal.");
      return;
    }

    const result = addToCart(meal, meal.provider as IProviderProfile, qty, {
      forceReplace,
    });

    if (result === "provider_mismatch" && !forceReplace) {
      setPendingQty(qty);
      setIsReplaceCartModalOpen(true);
      return;
    }

    toast.success(`${meal.title} added to cart.`);
  };

  const handleConfirmReplaceCart = () => {
    setIsReplaceCartModalOpen(false);
    handleAddToCart(pendingQty, true);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-100 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative h-80 sm:h-96 lg:h-full bg-slate-100">
              {meal.image ? (
                <img src={meal.image} alt={meal.title} className="h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">No Image</div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/45 to-transparent" />
            </div>

            <div className="p-6 sm:p-8 lg:p-10 flex flex-col gap-7">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none">
                  {meal.category?.name || "Meal"}
                </Badge>
                {meal.dietaryTag && meal.dietaryTag !== "NONE" ? (
                  <Badge variant="secondary" className="uppercase tracking-wide text-[11px]">
                    {meal.dietaryTag.replace("_", " ")}
                  </Badge>
                ) : null}
                <Badge
                  variant={meal.isAvailable ? "default" : "outline"}
                  className={meal.isAvailable ? "bg-emerald-600 hover:bg-emerald-600" : "text-slate-500"}
                >
                  {meal.isAvailable ? "Available" : "Unavailable"}
                </Badge>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">{meal.title}</h1>
                <p className="mt-2 text-3xl font-extrabold text-indigo-700">${meal.price.toFixed(2)}</p>

                <div className="mt-3 flex items-center gap-3 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{averageRating || "New"}</span>
                  </div>
                  <span className="text-slate-300">|</span>
                  <span>{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</span>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed">{meal.description}</p>

              <Card className="border-slate-200 shadow-none">
                <CardContent className="p-4 sm:p-5 space-y-4">
                  {totalItems > 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <p className="font-semibold text-slate-700">Current Cart</p>
                        <p className="font-bold text-slate-900">{totalItems} item{totalItems > 1 ? "s" : ""}</p>
                      </div>
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>{providerInfo?.restaurantName || "Restaurant"}</span>
                        <span className="font-semibold text-slate-900">${totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-lg"
                          onClick={clearCart}
                        >
                          Clear Cart
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-lg"
                          onClick={() => router.push("/checkout")}
                        >
                          Go to Checkout
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {hasForeignProviderCart ? (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      Your cart currently has items from another restaurant. Adding this meal will ask to replace that cart.
                    </p>
                  ) : null}

                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">Quantity</p>
                    <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-10 text-center font-bold text-slate-900">{quantity}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setQuantity((prev) => prev + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => handleAddToCart()}
                    disabled={!meal.isAvailable}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {meal.isAvailable ? "Add to Cart" : "Currently Unavailable"}
                  </Button>
                </CardContent>
              </Card>

              <div className="pt-1 flex flex-col sm:flex-row gap-3">
                <Button asChild variant="outline" className="rounded-xl">
                  <Link href={`/restaurant/${meal.providerId}`}>View Restaurant Menu</Link>
                </Button>
                <Button asChild variant="ghost" className="rounded-xl">
                  <Link href="/meals">Browse More Meals</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-black tracking-tight text-slate-900">Customer Reviews</CardTitle>
            <CardDescription>Only reviews from customers who ordered this meal</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-sm text-slate-500">No reviews yet for this meal.</p>
              </div>
            ) : (
              <Carousel opts={{ align: "start", loop: true }} className="w-full px-12">
                <CarouselContent>
                  {reviews.map((review) => (
                    <CarouselItem key={review.id} className="md:basis-1/2">
                      <div className="h-full rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <p className="font-semibold text-slate-900">{review.customer?.name || "Customer"}</p>
                          <div className="flex items-center gap-1 text-amber-500">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star
                                key={index}
                                className={`h-4 w-4 ${index < review.rating ? "fill-current" : "text-slate-300"}`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment ? (
                          <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
                        ) : (
                          <p className="text-sm text-slate-500">No written comment.</p>
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-0" />
                <CarouselNext className="right-0" />
              </Carousel>
            )}
          </CardContent>
        </Card>

        <Dialog open={isReplaceCartModalOpen} onOpenChange={setIsReplaceCartModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Replace Current Cart?</DialogTitle>
              <DialogDescription>
                Your cart contains items from another restaurant. Continuing will clear your current cart and add this meal.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReplaceCartModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmReplaceCart}>Replace and Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
