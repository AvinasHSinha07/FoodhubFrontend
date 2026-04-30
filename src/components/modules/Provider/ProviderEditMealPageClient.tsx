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
        <Skeleton className="h-12 w-64 mb-6" />
        <Skeleton className="h-[600px] w-full rounded-[24px]" />
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card className="text-center py-24 bg-background border-border/50 rounded-[24px] shadow-sm">
          <h2 className="text-2xl font-extrabold text-foreground">Meal Not Found</h2>
          <p className="text-slate-500 font-medium mt-2">The meal you are looking for may have been deleted.</p>
          <Button asChild className="mt-8 h-12 px-8 rounded-[14px] bg-[#377771] hover:bg-[#4CE0B3] text-white hover:text-emerald-950 font-bold transition-all shadow-md hover:-translate-y-0.5">
            <Link href="/provider/meals">Back to Menu</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-12 w-12 rounded-[14px] border-border/50 hover:bg-muted text-foreground transition-colors shrink-0" asChild>
          <Link href="/provider/meals">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground line-clamp-1">Edit <span className="text-[#377771] dark:text-[#4CE0B3]">{meal.title}</span></h1>
          <p className="text-slate-500 font-medium mt-1">Update meal details, pricing, and availability.</p>
        </div>
      </div>

      <Card className="rounded-[24px] border-border/50 bg-background shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/20 pb-6 pt-8 px-8">
          <CardTitle className="text-2xl font-extrabold text-foreground">Meal Configuration</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <MealForm initialData={meal} />
        </CardContent>
      </Card>
    </div>
  );
}
