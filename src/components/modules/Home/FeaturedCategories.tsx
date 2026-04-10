"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CategoryServices } from "@/services/category.services";
import { ICategory } from "@/types/category.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Coffee, Pizza, Croissant, Utensils, Sandwich, Salad, FileText } from "lucide-react";

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await CategoryServices.getCategories();
        setCategories(res.data?.slice(0, 6) || []); // Limit to 6
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCats();
  }, []);

  // mapping icon
  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("pizza") || n.includes("italian")) return <Pizza size={32} />;
    if (n.includes("burger") || n.includes("fast")) return <Sandwich size={32} />;
    if (n.includes("coffee") || n.includes("drink")) return <Coffee size={32} />;
    if (n.includes("bakery") || n.includes("dessert")) return <Croissant size={32} />;
    if (n.includes("salad") || n.includes("healthy")) return <Salad size={32} />;
    return <Utensils size={32} />;
  }

  return (
    <div className="py-16 bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="flex justify-between items-baseline mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Popular Categories</h2>
        <Link href="/meals" className="text-orange-600 hover:text-orange-700 font-medium">View All &rarr;</Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {[1,2,3,4,5,6].map((n) => (
            <Skeleton key={n} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
         <div className="text-center py-10 text-gray-500">No categories found</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {categories.map((cat) => (
             <Link 
              href={`/meals?category=${cat.id}`} 
              key={cat.id}
              className="group bg-orange-50 hover:bg-orange-100 transition-colors rounded-xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md cursor-pointer"
             >
                <div className="bg-white p-3 rounded-full shadow-sm text-orange-600 mb-4 group-hover:scale-110 transition-transform">
                  {getIcon(cat.name)}
                </div>
                <h3 className="font-semibold text-gray-800">{cat.name}</h3>
             </Link>
          ))}
        </div>
      )}
    </div>
  );
}