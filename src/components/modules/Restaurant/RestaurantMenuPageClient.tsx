"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProviderProfileServices } from "@/services/providerProfile.services";
import { FavoriteServices } from "@/services/favorite.services";
import { IProviderProfile } from "@/types/user.types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/CartProvider";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  ArrowLeft, 
  Utensils, 
  MapPin, 
  Star, 
  ArrowRight, 
  Heart, 
  Clock, 
  Sparkles,
  ChevronRight,
  Info,
  Flame,
  CheckCircle2,
  TrendingUp,
  Tag,
  ShieldCheck,
  Quote
} from "lucide-react";
import { IMeal } from "@/types/meal.types";
import { queryKeys } from "@/lib/query/query-keys";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import ReviewSlider from "@/components/shared/ReviewSlider";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type RestaurantMenuPageClientProps = {
  providerId: string;
};

export default function RestaurantMenuPageClient({ providerId }: RestaurantMenuPageClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const { items, addToCart, updateQuantity, totalPrice, clearCart, providerId: cartProviderId, providerInfo } = useCart();
  const [isReplaceCartModalOpen, setIsReplaceCartModalOpen] = useState(false);
  const [pendingMeal, setPendingMeal] = useState<IMeal | null>(null);

  const { data, isLoading, isFetching: isProviderFetching, refetch: refetchProvider } = useQuery({
    queryKey: queryKeys.provider(providerId),
    queryFn: () => ProviderProfileServices.getProviderById(providerId),
    staleTime: 1000 * 60 * 10,
  });

  const provider = (data?.data || null) as IProviderProfile | null;

  const { data: mealFavoritesResponse } = useQuery({
    queryKey: queryKeys.mealFavorites(`restaurant-${providerId}`),
    queryFn: () => FavoriteServices.getMealFavorites({ page: 1, limit: 100 }),
    staleTime: 1000 * 60,
    retry: false,
  });

  const { data: providerFavoriteStateResponse } = useQuery({
    queryKey: queryKeys.providerFavoriteState(providerId),
    queryFn: () => FavoriteServices.getProviderFavoriteState(providerId),
    staleTime: 1000 * 60,
    retry: false,
  });

  const favoriteMealIds = new Set(
    ((mealFavoritesResponse?.data || []) as any[])
      .map((favorite) => favorite.meal?.id)
      .filter(Boolean)
  );
  const isProviderFavorited = providerFavoriteStateResponse?.data?.favorited || false;

  const toggleMealFavoriteMutation = useMutation({
    mutationFn: (mealId: string) => FavoriteServices.toggleMealFavorite(mealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-favorites"] });
      queryClient.invalidateQueries({ queryKey: ["meal-favorite-state"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Unable to update favorites.");
    },
  });

  const toggleProviderFavoriteMutation = useMutation({
    mutationFn: () => FavoriteServices.toggleProviderFavorite(providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-favorites"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.providerFavoriteState(providerId) });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Unable to update favorites.");
    },
  });

  useEffect(() => {
    if (!isLoading && !provider && cartProviderId === providerId) {
      clearCart();
    }
  }, [isLoading, provider, cartProviderId, providerId, clearCart]);

  useEffect(() => {
    if (!isLoading && provider) {
      gsap.fromTo(".reveal-up", 
        { y: 40, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          stagger: 0.1, 
          ease: "power4.out",
          scrollTrigger: {
            trigger: ".reveal-container",
            start: "top 80%",
          }
        }
      );
    }
  }, [isLoading, provider]);

  const getCartQuantity = (mealId: string) => {
    return items.find((item) => item.meal.id === mealId)?.quantity || 0;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-20 px-4 mt-20">
        <Skeleton className="h-[400px] w-full mb-12 rounded-[48px]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-12 w-64" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-72 w-full rounded-[32px]" />
                ))}
              </div>
           </div>
           <Skeleton className="h-[600px] w-full rounded-[32px]" />
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-8">
           <Utensils className="h-12 w-12 text-slate-300" />
        </div>
        <h2 className="text-4xl font-black text-foreground mb-4">Kitchen not found</h2>
        <p className="text-slate-500 font-medium max-w-md mx-auto mb-10">We couldn't find this specific kitchen. It might have changed locations or moved to a different district.</p>
        <Button asChild className="h-14 px-10 rounded-[18px] bg-[#377771] hover:bg-[#4CE0B3] text-white hover:text-emerald-950 font-bold shadow-xl transition-all active:scale-95">
          <Link href="/restaurants"><ArrowLeft className="mr-3 h-5 w-5" /> Back to Restaurants</Link>
        </Button>
      </div>
    );
  }

  const availableMeals = provider.meals?.filter((meal: any) => meal.isAvailable) || [];
  const reviews =
    provider?.meals?.flatMap((meal: any) =>
      (meal.reviews || []).map((review: any) => ({
        ...review,
        mealTitle: meal.title,
      }))
    ) || [];
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : "New";
  const reviewCount = reviews.length;
  const bannerImage =
    provider.bannerImage ||
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1600";

  const handleAddToOrder = (meal: IMeal) => {
    const result = addToCart(meal, provider);

    if (result === "provider_mismatch") {
      setPendingMeal(meal);
      setIsReplaceCartModalOpen(true);
    }
  };

  const handleConfirmReplaceCart = () => {
    if (!pendingMeal) {
      return;
    }

    addToCart(pendingMeal, provider, 1, { forceReplace: true });
    setPendingMeal(null);
    setIsReplaceCartModalOpen(false);
  };

  const handleProceedToCheckout = async () => {
    if (cartProviderId === providerId) {
      const latestProviderResponse = await refetchProvider();
      const latestProvider = (latestProviderResponse.data?.data || provider) as IProviderProfile | null;

      if (!latestProvider?.isOpenNow) {
        toast.error("Restaurant is currently closed. Please order during open hours.");
        return;
      }
    }

    router.push("/checkout");
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background pb-32">
      {/* Editorial Navigation */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/restaurants" className="group flex items-center text-sm font-black text-slate-500 hover:text-[#ED6A5E] transition-colors">
            <ArrowLeft className="mr-3 h-5 w-5 transition-transform group-hover:-translate-x-1" /> Browse Collections
          </Link>
          <div className="flex items-center gap-4">
             {provider.isOpenNow && (
               <Badge className="bg-[#4CE0B3]/10 text-[#377771] border-none px-4 py-1.5 rounded-full font-black text-[11px] uppercase tracking-widest animate-pulse">
                 Live Selection
               </Badge>
             )}
             <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" onClick={() => toggleProviderFavoriteMutation.mutate()}>
               <Heart className={`h-5 w-5 ${isProviderFavorited ? "fill-[#ED6A5E] text-[#ED6A5E]" : "text-slate-400"}`} />
             </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-16 pt-8">
        {/* Cinematic Hero Section */}
        <section className="relative group perspective-1000">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1 }}
             className="relative h-[450px] sm:h-[550px] w-full rounded-[48px] overflow-hidden bg-[#0A0F1E] shadow-2xl border border-white/5"
           >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-60 scale-105 group-hover:scale-100 transition-transform duration-[3s]"
                style={{ backgroundImage: `url(${bannerImage})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-[#0A0F1E]/40 to-transparent" />
              
              {/* Hero Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-16 space-y-8">
                 <div className="flex flex-col sm:flex-row sm:items-end gap-8">
                    <div className="relative shrink-0">
                       <div className="absolute -inset-2 bg-gradient-to-tr from-[#ED6A5E] to-[#4CE0B3] rounded-[36px] blur-xl opacity-30 animate-pulse" />
                       {provider.logo ? (
                         <img src={provider.logo} alt="Logo" className="relative w-24 h-24 sm:w-40 sm:h-40 rounded-[32px] border-4 border-[#0A0F1E] bg-white object-cover shadow-2xl" />
                       ) : (
                         <div className="relative w-24 h-24 sm:w-40 sm:h-40 rounded-[32px] border-4 border-[#0A0F1E] bg-slate-900 flex items-center justify-center shadow-2xl">
                           <Utensils className="h-12 w-12 text-slate-700" />
                         </div>
                       )}
                    </div>

                    <div className="space-y-4 pb-2">
                       <div className="flex items-center gap-3">
                          <div className="inline-flex items-center rounded-full bg-[#4CE0B3] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-950 shadow-lg shadow-[#4CE0B3]/20">
                             <Sparkles className="mr-2 h-3.5 w-3.5" /> Established Excellence
                          </div>
                          {provider.cuisineType && (
                             <Badge variant="outline" className="border-white/20 text-white/80 px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-widest backdrop-blur-md">
                                {provider.cuisineType}
                             </Badge>
                          )}
                       </div>
                       
                       <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white leading-tight">
                         {provider.restaurantName}
                       </h1>

                       <div className="flex flex-wrap items-center gap-8 text-white/70">
                          <div className="flex items-center gap-2">
                             <Star className="h-5 w-5 fill-[#FFAF87] text-[#FFAF87]" />
                             <span className="font-black text-white text-lg">{averageRating}</span>
                             <span className="text-xs font-bold uppercase tracking-widest opacity-60">({reviewCount} reviews)</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <MapPin className="h-5 w-5 text-[#ED6A5E]" />
                             <span className="text-sm font-bold truncate max-w-[200px] sm:max-w-none">{provider.address || "Heritage Kitchen"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <Clock className="h-5 w-5 text-[#4CE0B3]" />
                             <span className="text-sm font-bold uppercase tracking-widest">Est. {provider.estimatedReadyInMinutes || 30} mins</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Status Badge Overlays */}
              <div className="absolute top-10 right-10 flex flex-col gap-3 items-end">
                 <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl backdrop-blur-2xl border font-black text-xs uppercase tracking-widest shadow-2xl ${provider.isOpenNow ? "bg-[#4CE0B3]/10 border-[#4CE0B3]/20 text-[#4CE0B3]" : "bg-destructive/10 border-destructive/20 text-destructive"}`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${provider.isOpenNow ? "bg-[#4CE0B3] animate-pulse" : "bg-destructive"}`} />
                    {provider.isOpenNow ? "Kitchen Active" : "Currently Offline"}
                 </div>
                 {!provider.isOpenNow && provider.nextOpenAt && (
                   <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-xl font-bold text-[10px] text-white/60 uppercase tracking-widest">
                     Next cycle: {provider.nextOpenAt}
                   </div>
                 )}
              </div>
           </motion.div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 reveal-container">
          {/* Menu Section */}
          <section className="lg:col-span-8 space-y-12">
            <div className="flex flex-col gap-2 reveal-up">
              <div className="flex items-center gap-3">
                 <TrendingUp className="h-5 w-5 text-[#ED6A5E]" />
                 <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#ED6A5E]">Signature Curation</p>
              </div>
              <h2 className="text-5xl font-black tracking-tight text-foreground">Featured Menu</h2>
            </div>

            {availableMeals.length === 0 ? (
              <div className="reveal-up rounded-[40px] border border-dashed border-border/50 bg-muted/5 p-24 text-center">
                <Utensils className="h-16 w-16 text-slate-200 mx-auto mb-6" />
                <p className="text-2xl font-bold text-slate-400">The chef is refining today's selection.</p>
                <p className="text-slate-500 font-medium mt-3">Check back shortly for the updated seasonal menu.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {availableMeals.map((meal: IMeal) => {
                  const qty = getCartQuantity(meal.id);
                  return (
                    <Card key={meal.id} className="reveal-up group relative overflow-hidden rounded-[40px] border-border/50 bg-background shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full border hover:border-[#377771]/30">
                      <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-900">
                        {meal.image ? (
                          <img src={meal.image} alt={meal.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                             <Utensils className="h-10 w-10 opacity-20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        {/* Price Badge Overlays */}
                        <div className="absolute top-5 left-5">
                           {meal.dietaryTag && meal.dietaryTag !== "NONE" && (
                              <Badge className="bg-[#4CE0B3] text-emerald-950 border-none px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider shadow-lg">
                                 {meal.dietaryTag.replace("_", " ")}
                              </Badge>
                           )}
                        </div>
                        
                        <div className="absolute top-5 right-5">
                           <Button
                             size="icon"
                             variant="secondary"
                             className="rounded-full bg-white/90 backdrop-blur-sm hover:bg-white border-none shadow-lg w-10 h-10"
                             onClick={(e) => {
                               e.preventDefault();
                               toggleMealFavoriteMutation.mutate(meal.id);
                             }}
                           >
                             <Heart className={`h-5 w-5 ${favoriteMealIds.has(meal.id) ? "fill-[#ED6A5E] text-[#ED6A5E]" : "text-slate-400"}`} />
                           </Button>
                        </div>
                      </div>

                      <CardContent className="p-8 space-y-6 flex flex-col flex-1">
                        <Link href={`/meals/${meal.id}`} className="block space-y-3 flex-1 group/title">
                           <div className="flex justify-between items-start gap-4">
                              <h3 className="text-2xl font-black text-foreground line-clamp-1 group-hover/title:text-[#ED6A5E] transition-colors">{meal.title}</h3>
                              <span className="text-2xl font-black text-[#377771] dark:text-[#4CE0B3]">${meal.price.toFixed(2)}</span>
                           </div>
                           <p className="text-slate-500 font-medium leading-relaxed line-clamp-2 italic">
                              "{meal.description || "A masterfully prepared creation from our lead kitchen team."}"
                           </p>
                        </Link>

                        <div className="pt-6 border-t border-border/30">
                           {qty === 0 ? (
                              <Button
                                className="w-full h-14 rounded-[20px] bg-[#0A0F1E] dark:bg-white text-white dark:text-[#0A0F1E] hover:bg-[#ED6A5E] dark:hover:bg-[#ED6A5E] dark:hover:text-white font-black transition-all active:scale-95 shadow-xl hover:-translate-y-1 group"
                                onClick={() => handleAddToOrder(meal)}
                              >
                                <Plus className="mr-3 h-5 w-5 group-hover:rotate-90 transition-transform" /> Add to Order
                              </Button>
                           ) : (
                              <div className="flex items-center justify-between bg-muted/50 rounded-[22px] p-1.5 border border-border/50 h-14">
                                 <Button 
                                   variant="ghost" 
                                   size="icon" 
                                   className="h-11 w-11 rounded-[18px] bg-background hover:bg-slate-100 transition-all shadow-sm"
                                   onClick={() => updateQuantity(meal.id, qty - 1)}
                                 >
                                    <Minus className="h-5 w-5 text-slate-600" />
                                 </Button>
                                 <div className="flex flex-col items-center">
                                    <span className="text-xl font-black text-foreground">{qty}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Selected</span>
                                 </div>
                                 <Button 
                                   variant="ghost" 
                                   size="icon" 
                                   className="h-11 w-11 rounded-[18px] bg-[#ED6A5E] hover:bg-[#FF8E72] text-white transition-all shadow-lg shadow-[#ED6A5E]/20"
                                   onClick={() => handleAddToOrder(meal)}
                                 >
                                    <Plus className="h-5 w-5" />
                                 </Button>
                              </div>
                           )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* ─── Reviews ─── */}
            {reviews.length > 0 && (
              <ReviewSlider
                reviews={reviews}
                averageRating={averageRating}
                reviewCount={reviewCount}
                title="Customer Reviews"
                subtitle="What our community is saying"
                showMealTag
              />
            )}
          </section>

          {/* Sidebar Cart Section */}
          <aside className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
            <Card className="reveal-up rounded-[40px] border-border/50 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] bg-background overflow-hidden border">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#ED6A5E] via-[#FFAF87] to-[#4CE0B3]" />
              
              <CardHeader className="p-10 pb-6 border-b border-border/30 bg-muted/20">
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <CardTitle className="text-3xl font-black text-foreground">Your Order</CardTitle>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Curating your selection</p>
                   </div>
                   <div className="w-14 h-14 rounded-2xl bg-[#ED6A5E]/10 flex items-center justify-center text-[#ED6A5E] shadow-inner">
                      <ShoppingCart className="h-7 w-7" />
                   </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {items.length > 0 && cartProviderId && cartProviderId !== providerId ? (
                  <div className="m-8 rounded-2xl border border-amber-200 bg-amber-50/50 p-5 flex items-start gap-4">
                     <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                     <p className="text-xs font-bold text-amber-800 leading-relaxed uppercase tracking-wide">
                        Your current cart belongs to <span className="text-amber-950 underline">{providerInfo?.restaurantName || "another partner"}</span>. 
                        Adding items here will prioritize this kitchen.
                     </p>
                  </div>
                ) : null}

                {items.length === 0 ? (
                  <div className="p-20 text-center space-y-6">
                    <div className="w-24 h-24 bg-muted/40 rounded-[32px] flex items-center justify-center mx-auto border border-dashed border-border/50">
                       <Plus className="h-10 w-10 text-slate-300" />
                    </div>
                    <div className="space-y-2">
                       <p className="text-xl font-black text-foreground">Basket is empty</p>
                       <p className="text-sm font-medium text-slate-500">Explore the menu to add your first signature creation.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="max-h-[400px] overflow-y-auto px-10 py-8 space-y-8 custom-scrollbar">
                       {items.map((item) => (
                         <div key={item.meal.id} className="flex gap-5 items-start group">
                            <div className="h-20 w-20 rounded-[20px] overflow-hidden bg-muted shrink-0 border border-border/50 shadow-sm relative group-hover:shadow-md transition-shadow">
                               {item.meal.image ? (
                                 <img src={item.meal.image} alt={item.meal.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                               ) : (
                                 <Utensils className="h-8 w-8 m-6 text-slate-400" />
                               )}
                               <div className="absolute -top-1 -right-1 bg-[#ED6A5E] text-white w-7 h-7 flex items-center justify-center rounded-full text-xs font-black border-2 border-background shadow-lg">
                                 {item.quantity}
                               </div>
                            </div>
                            <div className="flex-1 space-y-1 py-1">
                               <h4 className="font-black text-foreground text-lg line-clamp-1 group-hover:text-[#ED6A5E] transition-colors">{item.meal.title}</h4>
                               <div className="flex items-center justify-between">
                                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">${item.meal.price.toFixed(2)} / unit</p>
                                  <p className="font-black text-[#377771] dark:text-[#4CE0B3] text-lg">${(item.meal.price * item.quantity).toFixed(2)}</p>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>

                    <div className="p-10 bg-muted/20 border-t border-border/30 space-y-10">
                       <div className="space-y-4">
                          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                             <span>Selection Subtotal</span>
                             <span className="text-foreground">${totalPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                             <span>Concierge Delivery</span>
                             <span className="text-[#4CE0B3]">Complimentary</span>
                          </div>
                          <div className="pt-6 border-t border-border/50 flex justify-between items-end">
                             <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Investment</p>
                                <p className="text-4xl font-black text-foreground">${totalPrice.toFixed(2)}</p>
                             </div>
                             <div className="pb-1 text-[10px] font-black text-slate-300 uppercase">USD</div>
                          </div>
                       </div>

                       <div className="flex flex-col gap-4">
                          <Button
                            className="w-full h-16 rounded-[22px] bg-[#ED6A5E] hover:bg-[#FF8E72] text-white font-black text-lg shadow-[0_20px_40px_-10px_rgba(237,106,94,0.4)] transition-all hover:-translate-y-1 active:scale-95 group"
                            onClick={handleProceedToCheckout}
                            disabled={isProviderFetching}
                          >
                             Checkout Now <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full h-12 rounded-[18px] font-bold text-slate-400 hover:text-destructive hover:bg-destructive/5 transition-all"
                            onClick={clearCart}
                          >
                            Reset Selection
                          </Button>
                       </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats / Info Cards */}
            <div className="grid grid-cols-2 gap-4 mt-8">
               <div className="p-6 rounded-[28px] border border-border/50 bg-background flex flex-col gap-3 reveal-up">
                  <Flame className="h-6 w-6 text-[#ED6A5E]" />
                  <div>
                     <p className="font-black text-sm text-foreground">High Demand</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top 5% this week</p>
                  </div>
               </div>
               <div className="p-6 rounded-[28px] border border-border/50 bg-background flex flex-col gap-3 reveal-up">
                  <ShieldCheck className="h-6 w-6 text-[#4CE0B3]" />
                  <div>
                     <p className="font-black text-sm text-foreground">Verified Hub</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Health Audit Passed</p>
                  </div>
               </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Cart Replacement Dialog */}
      <Dialog
        open={isReplaceCartModalOpen}
        onOpenChange={(open) => {
          setIsReplaceCartModalOpen(open);
          if (!open) setPendingMeal(null);
        }}
      >
        <DialogContent aria-describedby="restaurant-replace-cart-desc" className="rounded-[40px] p-10 max-w-lg border-border/50 bg-background shadow-2xl">
          <DialogHeader className="space-y-6">
             <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto border border-amber-100">
                <Utensils className="h-10 w-10 text-amber-500" />
             </div>
            <DialogTitle className="text-3xl font-black text-center text-foreground">Transition to this kitchen?</DialogTitle>
            <DialogDescription id="restaurant-replace-cart-desc" className="text-lg text-slate-500 font-medium text-center leading-relaxed">
              Your basket is currently highlighting creations from <span className="text-[#ED6A5E] font-bold">{providerInfo?.restaurantName || "another partner"}</span>. 
              Adding this will prioritize the current kitchen and clear previous selections.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-4 mt-10">
            <Button variant="ghost" onClick={() => setIsReplaceCartModalOpen(false)} className="h-14 rounded-2xl font-black text-slate-500 flex-1">
              Maintain Previous
            </Button>
            <Button onClick={handleConfirmReplaceCart} className="h-14 px-10 rounded-2xl bg-[#ED6A5E] hover:bg-[#FF8E72] text-white font-black shadow-lg shadow-[#ED6A5E]/20 flex-1">
              Prioritize Kitchen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
