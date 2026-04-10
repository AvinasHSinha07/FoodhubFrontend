"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProviderProfileServices } from "@/services/providerProfile.services";
import { IProviderProfile } from "@/types/user.types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/CartProvider";
import { ShoppingCart, Plus, Minus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { IMeal } from "@/types/meal.types";

export default function RestaurantMenuPage() {
  const { id } = useParams();
  const [provider, setProvider] = useState<IProviderProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { items, addToCart, removeFromCart, updateQuantity, totalPrice } = useCart();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await ProviderProfileServices.getProviderById(id as string);
        setProvider(response.data);
      } catch (error) {
        toast.error("Failed to load restaurant details");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchMenu();
  }, [id]);

  const getCartQuantity = (mealId: string) => {
    return items.find((item) => item.meal.id === mealId)?.quantity || 0;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4">
        <Skeleton className="h-64 w-full mb-10 rounded-xl" />
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4 text-center">
        <h2 className="text-2xl font-bold">Restaurant not found</h2>
        <Button asChild className="mt-4"><Link href="/">Back to Home</Link></Button>
      </div>
    );
  }

  const availableMeals = provider.meals?.filter(m => m.isAvailable) || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Restaurant Header */}
      <div 
        className="h-64 bg-gray-900 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${provider.bannerImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200"})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col justify-end p-8 max-w-7xl mx-auto">
          <Button variant="link" className="text-white hover:text-gray-300 w-fit p-0 mb-4" asChild>
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to all restaurants</Link>
          </Button>
          <div className="flex gap-4 items-end">
            {provider.logo && (
              <img src={provider.logo} alt="Logo" className="h-20 w-20 rounded-full border-4 border-white bg-white object-cover" />
            )}
            <div className="text-white">
              <h1 className="text-4xl font-bold mb-2">{provider.restaurantName}</h1>
              <div className="flex gap-2">
                {provider.cuisineType && <Badge>{provider.cuisineType}</Badge>}
                <Badge variant="outline" className="text-white border-white/50">{provider.address}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu & Cart Grid */}
      <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Menu Items */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-semibold mb-4">Menu</h2>
          {availableMeals.length === 0 ? (
            <p className="text-gray-500">This restaurant has no available items yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableMeals.map((meal: IMeal) => {
                const qty = getCartQuantity(meal.id);
                return (
                  <Card key={meal.id} className="flex flex-col">
                    <CardHeader className="p-4 flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <CardTitle className="text-lg">{meal.title}</CardTitle>
                          <CardDescription className="line-clamp-2 mt-1">{meal.description}</CardDescription>
                        </div>
                        {meal.image && (
                          <img src={meal.image} alt={meal.title} className="h-16 w-16 object-cover rounded-md" />
                        )}
                      </div>
                      <div className="mt-2 font-bold text-gray-900">${meal.price.toFixed(2)}</div>
                      {meal.dietaryTag && meal.dietaryTag !== 'NONE' && (
                        <Badge variant="secondary" className="mt-2 w-fit text-xs">{meal.dietaryTag.replace('_', ' ')}</Badge>
                      )}
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      {qty === 0 ? (
                        <Button 
                          className="w-full" 
                          variant="outline" 
                          onClick={() => addToCart(meal, provider)}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add to Cart
                        </Button>
                      ) : (
                        <div className="flex items-center justify-between border rounded-md p-1">
                          <Button variant="ghost" size="icon" onClick={() => updateQuantity(meal.id, qty - 1)}>
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-semibold">{qty}</span>
                          <Button variant="ghost" size="icon" onClick={() => addToCart(meal, provider)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card className="border-primary/20 shadow-md">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" /> Your Order
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {items.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Your cart is empty.</p>
                ) : (
                  <>
                    <div className="max-h-[40vh] overflow-y-auto space-y-4 pr-2">
                      {items.map((item) => (
                        <div key={item.meal.id} className="flex justify-between items-start text-sm">
                          <div className="flex-1">
                            <p className="font-medium">{item.meal.title}</p>
                            <p className="text-gray-500">${item.meal.price.toFixed(2)} x {item.quantity}</p>
                          </div>
                          <p className="font-semibold">${(item.meal.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total (USD)</span>
                        <span>${totalPrice.toFixed(2)}</span>
                      </div>
                      <Button className="w-full mt-4" size="lg" asChild>
                        <Link href="/checkout">Checkout</Link>
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
