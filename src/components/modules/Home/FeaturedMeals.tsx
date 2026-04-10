"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MealServices } from "@/services/meal.services";
import { IMeal } from "@/types/meal.types";
import { Card, CardContent, CardTitle, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function FeaturedMeals() {
  const [meals, setMeals] = useState<IMeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await MealServices.getAllMeals({ isAvailable: true });
        setMeals(response.data?.slice(0, 8) || []);
      } catch (error) {
        console.error("Failed to fetch meals");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMeals();
  }, []);

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-baseline mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Featured Meals</h2>
          <Link href="/meals" className="text-orange-600 hover:text-orange-700 font-medium">View All &rarr;</Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="space-y-3">
                <Skeleton className="h-48 rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No popular meals at the moment.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {meals.map((meal) => (
              <Card key={meal.id} className="overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full border-gray-200">
                <div 
                  className="h-48 w-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${meal.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop"})`
                  }}
                />
                <CardHeader className="flex-1 pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg line-clamp-1">{meal.title}</CardTitle>
                    <span className="font-bold text-orange-600">${meal.price}</span>
                  </div>
                  {meal.dietaryTag && (
                     <Badge variant="outline" className="text-xs w-max mt-1">{meal.dietaryTag}</Badge>
                  )}
                  <CardDescription className="line-clamp-2 mt-2">
                    {meal.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <p className="text-xs text-gray-500 mb-3">
                    By {meal.provider?.restaurantName || "Anonymous"}
                  </p>
                  <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
                    <Link href={`/restaurant/${meal.providerId}`}>Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}