"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MealServices } from "@/services/meal.services";
import { CategoryServices } from "@/services/category.services";
import { IMeal, IMealFilters } from "@/types/meal.types";
import { ICategory } from "@/types/category.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, ArrowRight, Utensils } from "lucide-react";
import Link from "next/link";

function MealsPageContent() {
  const searchParams = useSearchParams();
  const searchParam = searchParams?.get("search") || "";

  const [meals, setMeals] = useState<IMeal[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [dietaryTag, setDietaryTag] = useState("");

  const dietOptions = [
    "VEGETARIAN",
    "VEGAN",
    "GLUTEN_FREE",
    "HALAL",
    "KETO",
    "PALEO",
    "NUT_FREE",
    "DAIRY_FREE",
  ];

  const fetchMeals = async () => {
    setIsLoading(true);
    try {
      const filters: IMealFilters = {
        searchTerm,
        categoryId: selectedCategory || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        dietaryTag: dietaryTag || undefined,
        isAvailable: true,
      };

      const [mealsRes, catsRes] = await Promise.all([
        MealServices.getAllMeals(filters),
        CategoryServices.getCategories(),
      ]);

      setMeals(mealsRes.data || []);
      setCategories(catsRes.data || []);
    } catch (error) {
      console.error("Error fetching meals:", error);
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
    <div className="bg-slate-50 min-h-screen pb-20 font-sans" style={{ fontFamily: "var(--font-sora)" }}>
      {/* Hero Section */}
      <div className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden bg-slate-900 border-b border-slate-800">
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-[20%] left-[10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-60 animate-blob"></div>
          <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-pink-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-60 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] flex items-center justify-center opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">Amazing Dishes</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-medium mb-4">
            Find the perfect meal for your cravings using our advanced filters. From healthy salads to indulgent pizzas, we have it all.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-8 -mt-8 relative z-20">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-xl border-slate-100 rounded-3xl bg-white/90 backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-pink-500"></div>
            <CardHeader className="pb-4 border-b border-slate-100/50 bg-white/50 backdrop-blur-sm">
               <CardTitle className="text-xl flex items-center gap-2 font-bold text-slate-800" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                 <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
                 Filters
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleApplyFilters} className="space-y-6">
                
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Search Keyword</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="e.g. Pizza, Salad..." 
                      className="pl-10 border-slate-200 focus-visible:ring-indigo-500 rounded-xl bg-slate-50"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Category</label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow text-slate-700"
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
                  <label className="text-sm font-bold text-slate-700">Price Range ($)</label>
                  <div className="flex gap-3 items-center">
                    <Input 
                      type="number" 
                      placeholder="Min" 
                      value={minPrice} 
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="border-slate-200 focus-visible:ring-indigo-500 rounded-xl bg-slate-50"
                    />
                    <span className="text-slate-400 font-bold">-</span>
                    <Input 
                      type="number" 
                      placeholder="Max" 
                      value={maxPrice} 
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="border-slate-200 focus-visible:ring-indigo-500 rounded-xl bg-slate-50"
                    />
                  </div>
                </div>

                {/* Dietary Tag */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Dietary Focus</label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow text-slate-700"
                    value={dietaryTag}
                    onChange={(e) => setDietaryTag(e.target.value)}
                  >
                    <option value="">Any Diet</option>
                    {dietOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                
                <div className="pt-4 flex flex-col gap-3">
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md font-bold transition-all">
                    Apply Filters
                  </Button>
                  <Button type="button" variant="outline" className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold" onClick={handleResetFilters}>
                    Reset All
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Results Grid */}
        <div className="lg:col-span-3 mt-8 lg:mt-0">
           {isLoading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1, 2, 3, 4, 5, 6].map((n) => (
                 <div key={n} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
                   <Skeleton className="h-48 w-full rounded-2xl mb-4" />
                   <Skeleton className="h-6 w-3/4 mb-2" />
                   <Skeleton className="h-4 w-1/4 mb-4" />
                   <Skeleton className="h-10 w-full rounded-xl" />
                 </div>
               ))}
             </div>
           ) : meals.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm col-span-full">
               <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Utensils className="w-10 h-10 text-indigo-300" />
               </div>
               <h3 className="text-2xl font-bold text-slate-800 mb-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>No meals found</h3>
               <p className="text-slate-500 text-lg max-w-md mx-auto">Try adjusting your filters or search term to discover exactly what you're craving.</p>
               <Button onClick={handleResetFilters} variant="outline" className="mt-6 rounded-full font-bold">Clear All Filters</Button>
             </div>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {meals.map((meal) => (
                  <Card key={meal.id} className="overflow-hidden border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group rounded-3xl bg-white flex flex-col h-full">
                    {meal.image ? (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={meal.image}
                            alt={meal.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                          />
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full font-bold text-slate-900 text-sm shadow-sm flex items-center">
                            <span className="text-indigo-600 mr-0.5">$</span>{meal.price.toFixed(2)}
                          </div>
                          {meal.dietaryTag && meal.dietaryTag !== 'NONE' && (
                            <Badge className="absolute top-3 left-3 bg-emerald-500/90 hover:bg-emerald-600 text-white backdrop-blur-sm border-none uppercase text-[10px] tracking-wider font-bold shadow-sm">
                              {meal.dietaryTag.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                    ) : (
                        <div className="p-6 pb-0 flex justify-between items-start gap-4">
                           <div className="flex-1">
                              <CardTitle className="text-xl font-bold text-slate-900 line-clamp-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>{meal.title}</CardTitle>
                           </div>
                           <div className="font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-full text-sm shrink-0 flex items-center">
                              <span className="text-indigo-600 mr-0.5">$</span>{meal.price.toFixed(2)}
                           </div>
                        </div>
                    )}
                    
                    <CardHeader className="\ flex-1">
                      {meal.image && (
                        <CardTitle className="text-xl font-bold text-slate-900 line-clamp-1" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                          {meal.title}
                        </CardTitle>
                      )}
                      <CardDescription className="line-clamp-2 mt-1.5 text-slate-500 text-sm leading-relaxed">
                        {meal.description || "A perfectly prepared dish right to your door."}
                      </CardDescription>
                      
                      {!meal.image && meal.dietaryTag && meal.dietaryTag !== 'NONE' && (
                        <Badge variant="secondary" className="mt-4 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 w-fit text-xs uppercase tracking-wider font-bold shadow-sm">
                          {meal.dietaryTag.replace('_', ' ')}
                        </Badge>
                      )}
                    </CardHeader>
                    
                    <CardContent className="px-5 pb-5 pt-4 mt-auto bg-white border-t border-slate-50 flex flex-col gap-4">
                      <p className="text-xs text-slate-400 flex items-center">
                        <span>By</span>
                        <span className="font-bold text-slate-700 ml-1 truncate">{meal.provider?.restaurantName || "Unknown Chef"}</span>
                      </p>
                      <Button asChild className="w-full bg-slate-100 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-xl shadow-none transition-colors duration-300 font-bold group/btn">
                        <Link href={`/restaurant/${meal.provider?.id || ''}`}>
                          View Restaurant <ArrowRight className="ml-2 w-4 h-4 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                        </Link>
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
    <Suspense fallback={<div className="min-h-screen flex text-center justify-center pt-40"><Skeleton className="w-32 h-10 rounded-full" /></div>}>
      <MealsPageContent />
    </Suspense>
  )
}
