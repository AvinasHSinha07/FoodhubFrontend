"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MealServices, IMealFilters } from "@/services/meal.services";
import { CategoryServices } from "@/services/category.services";
import { IMeal } from "@/types/meal.types";
import { ICategory } from "@/types/category.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, Search } from "lucide-react";

function MealsPageContent() {
  const searchParams = useSearchParams();
  const initCategory = searchParams.get("category") || "";

  const [meals, setMeals] = useState<IMeal[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initCategory);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [dietaryTag, setDietaryTag] = useState("");

  const dietOptions = ["Vegan", "Vegetarian", "Gluten-Free", "Halal", "Keto"];

  useEffect(() => {
    CategoryServices.getCategories().then((res) => {
      setCategories(res.data || []);
    }).catch(console.error);
  }, []);

  const fetchMeals = async () => {
    setIsLoading(true);
    try {
      const filters: IMealFilters = { isAvailable: true };
      if (searchTerm) filters.searchTerm = searchTerm;
      if (selectedCategory) filters.categoryId = selectedCategory;
      if (minPrice) filters.minPrice = Number(minPrice);
      if (maxPrice) filters.maxPrice = Number(maxPrice);
      if (dietaryTag) filters.dietaryTag = dietaryTag;

      const response = await MealServices.getAllMeals(filters);
      setMeals(response.data || []);
    } catch (error) {
      console.error("Failed to fetch meals", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMeals();
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setDietaryTag("");
    setTimeout(() => {
      const filters: IMealFilters = { isAvailable: true };
      MealServices.getAllMeals(filters).then(res => setMeals(res.data || []));
    }, 0);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8">
         <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Discover Meals</h1>
         <p className="text-lg text-gray-600 max-w-2xl mx-auto">Find the perfect dish for your cravings using our advanced filters.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6 shadow-sm border-gray-200">
            <CardHeader className="pb-4 border-b">
               <CardTitle className="text-xl flex items-center gap-2">
                 <Filter size={20} />
                 Filters
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleApplyFilters} className="space-y-6">
                
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Keyword</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input 
                      placeholder="e.g. Pizza, Salad..." 
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select 
                    className="w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price Range ($)</label>
                  <div className="flex gap-2 items-center">
                    <Input 
                      type="number" 
                      placeholder="Min" 
                      value={minPrice} 
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <span className="text-gray-400">-</span>
                    <Input 
                      type="number" 
                      placeholder="Max" 
                      value={maxPrice} 
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>

                {/* Dietary Tag */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dietary Tag</label>
                  <select 
                    className="w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={dietaryTag}
                    onChange={(e) => setDietaryTag(e.target.value)}
                  >
                    <option value="">Any Diet</option>
                    {dietOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                
                <div className="pt-2 flex flex-col gap-2">
                  <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">Apply Filters</Button>
                  <Button type="button" variant="outline" className="w-full text-gray-600" onClick={handleResetFilters}>Reset</Button>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>

        {/* Results Grid */}
        <div className="lg:col-span-3">
           {isLoading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
               {[1, 2, 3, 4, 5, 6].map((n) => (
                 <div key={n} className="space-y-3">
                   <Skeleton className="h-48 rounded-xl" />
                   <Skeleton className="h-4 w-3/4" />
                   <Skeleton className="h-4 w-1/2" />
                 </div>
               ))}
             </div>
           ) : meals.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
               <h3 className="text-xl font-semibold text-gray-800 mb-2">No meals found</h3>
               <p className="text-gray-500">Try adjusting your filters or search term to find what you're looking for.</p>
               <Button onClick={handleResetFilters} variant="outline" className="mt-4">Clear All Filters</Button>
             </div>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {meals.map((meal) => (
                  <Card key={meal.id} className="overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full border-gray-200 group">
                    <div 
                      className="h-48 w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{
                        backgroundImage: `url(${meal.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop"})`
                      }}
                    />
                    <CardHeader className="flex-1 pb-2 z-10 bg-white">
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
                    <CardContent className="pt-2 z-10 bg-white">
                      <p className="text-xs text-gray-500 mb-3">
                        By <span className="font-medium text-gray-700">{meal.provider?.restaurantName || "Anonymous"}</span>
                      </p>
                      <Button asChild className="w-full bg-white text-orange-600 border border-orange-200 hover:bg-orange-50 font-medium">
                        <Link href={`/restaurant/${meal.providerId}`}>View Restaurant</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

export default function MealsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex text-center justify-center pt-20"><Skeleton className="w-[300px] h-10" /></div>}>
      <MealsPageContent />
    </Suspense>
  )
}