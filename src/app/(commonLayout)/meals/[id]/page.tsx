import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { MealServices } from "@/services/meal.services";
import { ShoppingCart } from "lucide-react";

interface MealDetailsProps {
  params: Promise<{ id: string }>;
}

export default async function MealDetailsPage({ params }: MealDetailsProps) {
  const resolvedParams = await params;
  // Fallback to avoid error if getMealById is not fully matching this signature yet
  // const meal = await getMealById(resolvedParams.id);
  
  return (
    <div className="container mx-auto py-10 px-4 md:px-0 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative h-96 w-full rounded-xl overflow-hidden shadow-lg">
          {/* Placeholder for actual image */}
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">Meal Image</span>
          </div>
        </div>
        
        <div className="flex flex-col space-y-6 justify-center">
          <div>
            <Badge className="mb-2">Category Name</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-primary">Meal Name</h1>
            <p className="text-2xl font-semibold text-primary/80 mt-2">$24.99</p>
          </div>
          
          <div className="prose prose-sm dark:prose-invert">
            <p className="space-y-4 text-muted-foreground leading-relaxed">
              Detailed description of the meal goes here. This placeholder text shows where you can provide comprehensive details about the ingredients, preparation methods, dietary information, and flavor profile of the dish.
            </p>
          </div>

          <div className="pt-4 flex gap-4 border-t">
            <Button size="lg" className="w-full sm:w-auto">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
