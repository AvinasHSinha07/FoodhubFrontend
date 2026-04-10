"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProviderProfileServices } from "@/services/providerProfile.services";
import { IProviderProfile } from "@/types/user.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function RestaurantsPage() {
  const [providers, setProviders] = useState<IProviderProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await ProviderProfileServices.getAllProviders();
        setProviders(response.data || []);
      } catch (error) {
        console.error("Failed to fetch restaurants");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProviders();
  }, []);

  const filteredProviders = providers.filter(p => 
    p.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.cuisineType && p.cuisineType.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Restaurants</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Explore all local culinary partners and their amazing menus.</p>
        
        <div className="max-w-md mx-auto mt-8 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input 
            placeholder="Search by restaurant name or cuisine..." 
            className="pl-10 py-6 rounded-full shadow-sm text-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="flex flex-col space-y-3">
                <Skeleton className="h-56 w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed">
            <h3 className="text-xl font-medium text-gray-900 mb-2">No restaurants match your search.</h3>
            <p className="text-gray-500">Try a different keyword or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredProviders.map((provider) => (
              <Card key={provider.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div
                  className="h-56 bg-gray-200 bg-cover bg-center transition-transform hover:scale-105 duration-500"
                  style={{ backgroundImage: `url(${provider.bannerImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800"})` }}
                />
                <CardHeader className="bg-white z-10 relative">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl text-gray-900 group-hover:text-orange-600 transition-colors">{provider.restaurantName}</CardTitle>
                    {provider.cuisineType && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-none">{provider.cuisineType}</Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2 mt-2 text-sm text-gray-500">
                    {provider.description || "A wonderful place to grab a bite."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="bg-white z-10 relative">
                  <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate block w-full">{provider.address}</span>
                  </div>
                  <Button asChild className="w-full bg-white text-orange-600 border border-orange-200 hover:bg-orange-50 font-medium">
                    <Link href={`/restaurant/${provider.id}`}>View Menu</Link>
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