"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProviderProfileServices } from "@/services/providerProfile.services";
import { IProviderProfile } from "@/types/user.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const [providers, setProviders] = useState<IProviderProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">FoodHub</h1>
          <nav className="flex gap-4">
            <Button variant="ghost" asChild><Link href="/login">Login</Link></Button>
            <Button asChild><Link href="/register">Register</Link></Button>
            <Button variant="outline" asChild><Link href="/customer/orders">My Orders</Link></Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Available Restaurants</h2>
          <p className="text-gray-600">Discover top-rated food near you.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="flex flex-col space-y-3">
                <Skeleton className="h-48 w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border">
            <h3 className="text-lg font-medium text-gray-900">No restaurants found</h3>
            <p className="mt-1 text-gray-500">Check back later for new options.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <Card key={provider.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div 
                  className="h-48 bg-gray-200 bg-cover bg-center"
                  style={{ backgroundImage: `url(${provider.bannerImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800"})` }}
                />
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{provider.restaurantName}</CardTitle>
                    {provider.cuisineType && (
                      <Badge variant="secondary">{provider.cuisineType}</Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {provider.description || "No description available."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4 truncate">{provider.address}</p>
                  <Button asChild className="w-full">
                    <Link href={`/restaurant/${provider.id}`}>View Menu</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

