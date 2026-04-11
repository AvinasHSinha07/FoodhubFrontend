"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Star } from "lucide-react";
import { MealServices } from "@/services/meal.services";
import { ReviewServices } from "@/services/review.services";
import { queryKeys } from "@/lib/query/query-keys";
import { IMeal } from "@/types/meal.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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

  return (
    <div className="container mx-auto py-10 px-4 md:px-0 max-w-5xl space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative h-96 w-full rounded-xl overflow-hidden shadow-lg bg-gray-100">
          {meal.image ? (
            <img src={meal.image} alt={meal.title} className="h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">No Image</div>
          )}
        </div>

        <div className="flex flex-col space-y-6 justify-center">
          <div>
            <Badge className="mb-2">{meal.category?.name || "Meal"}</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-primary">{meal.title}</h1>
            <p className="text-2xl font-semibold text-primary/80 mt-2">${meal.price.toFixed(2)}</p>
            {averageRating ? (
              <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                {averageRating} ({reviews.length} reviews)
              </p>
            ) : null}
          </div>

          <p className="text-muted-foreground leading-relaxed">{meal.description}</p>

          <div className="pt-4 flex gap-4 border-t flex-wrap">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={`/restaurant/${meal.providerId}`}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                View Restaurant Menu
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/meals">Browse More Meals</Link>
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
          <CardDescription>What customers are saying about this meal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500">No reviews yet for this meal.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{review.customer?.name || "Customer"}</p>
                  <p className="text-xs text-gray-500">Rating: {review.rating}/5</p>
                </div>
                {review.comment ? <p className="text-sm text-gray-700">{review.comment}</p> : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
