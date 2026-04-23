"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProviderProfileServices } from "@/services/providerProfile.services";
import { IProviderProfile } from "@/types/user.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function TopProviders() {
  const [providers, setProviders] = useState<IProviderProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await ProviderProfileServices.getAllProviders({ page: 1, limit: 12 });
        setProviders(response.data?.slice(0, 6) || []); 
      } catch (error) {
        console.error("Failed to fetch restaurants");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProviders();
  }, []);

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-baseline mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Top Rated Restaurants</h2>
          <Link href="/restaurants" className="text-orange-600 hover:text-orange-700 font-medium">Explore All &rarr;</Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex flex-col space-y-3">
                <Skeleton className="h-48 w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-62.5" />
                  <Skeleton className="h-4 w-50" />
                </div>
              </div>
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed">
            <h3 className="text-lg font-medium text-gray-900">No restaurants currently available.</h3>
            <p className="mt-1 text-gray-500">Check back later for new choices.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <Card key={provider.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                <div
                  className="h-48 bg-gray-200 bg-cover bg-center transition-transform hover:scale-105 duration-500"
                  style={{ backgroundImage: `url(${provider.bannerImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800"})` }}
                />
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl text-gray-900">{provider.restaurantName}</CardTitle>
                    {provider.cuisineType && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-none">{provider.cuisineType}</Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2 mt-1">
                    {provider.description || "A wonderful place to grab a bite."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{provider.address}</span>
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