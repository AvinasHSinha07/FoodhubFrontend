"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import MealForm from "@/components/modules/Provider/MealForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MealServices } from "@/services/meal.services";
import { IMeal } from "@/types/meal.types";
import { queryKeys } from "@/lib/query/query-keys";

type ProviderEditMealPageClientProps = {
  mealId: string;
};

export default function ProviderEditMealPageClient({ mealId }: ProviderEditMealPageClientProps) {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.meal(mealId),
    queryFn: () => MealServices.getMealById(mealId),
    staleTime: 1000 * 60 * 5,
  });

  const meal = (data?.data || null) as IMeal | null;

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-semibold mb-2">Meal Not Found</h2>
        <Button asChild>
          <Link href="/provider/meals">Back to Menu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/provider/meals">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Edit Meal: {meal.title}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <MealForm initialData={meal} />
        </CardContent>
      </Card>
    </div>
  );
}
