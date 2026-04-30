"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { 
  Minus, 
  Plus, 
  ShoppingCart, 
  Star, 
  ArrowLeft, 
  ChefHat, 
  Clock, 
  Flame, 
  Share2, 
  Heart,
  ShieldCheck,
  Zap,
  Quote
} from "lucide-react";
import { MealServices } from "@/services/meal.services";
import { ReviewServices } from "@/services/review.services";
import { queryKeys } from "@/lib/query/query-keys";
import { IMeal } from "@/types/meal.types";
import { IProviderProfile } from "@/types/user.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReviewSlider from "@/components/shared/ReviewSlider";
import { useCart } from "@/providers/CartProvider";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";

type ReviewItem = {
  id: string;
  rating: number;
  comment?: string | null;
  customer?: {
    name?: string;
    image?: string;
  };
  createdAt?: string;
};

type MealDetailsPageClientProps = {
  mealId: string;
};

export default function MealDetailsPageClient({ mealId }: MealDetailsPageClientProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { addToCart, clearCart, items, totalItems, totalPrice, providerId: cartProviderId, providerInfo } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isReplaceCartModalOpen, setIsReplaceCartModalOpen] = useState(false);
  const [pendingQty, setPendingQty] = useState(1);

  const { data: mealResponse, isLoading: isMealLoading } = useQuery({
    queryKey: queryKeys.meal(mealId),
    queryFn: () => MealServices.getMealById(mealId),
    staleTime: 1000 * 60 * 10,
  });

  const { data: reviewResponse, isLoading: isReviewsLoading } = useQuery({
    queryKey: queryKeys.mealReviews(mealId),
    queryFn: () => ReviewServices.getMealReviews(mealId),
    staleTime: 1000 * 60 * 5,
  });

  const meal = mealResponse?.data as IMeal | undefined;
  const reviews = (reviewResponse?.data || []) as ReviewItem[];

  useEffect(() => {
    if (!isMealLoading && meal) {
      gsap.fromTo(".reveal-up", 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, [isMealLoading, meal]);

  if (isMealLoading || isReviewsLoading) {
    return (
      <div className="max-w-7xl mx-auto py-20 px-4 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="h-[600px] w-full rounded-[40px]" />
          <div className="space-y-6 pt-10">
             <Skeleton className="h-6 w-32" />
             <Skeleton className="h-16 w-full" />
             <Skeleton className="h-24 w-full" />
             <Skeleton className="h-40 w-full rounded-[24px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
          <ChefHat className="h-10 w-10 text-slate-300" />
        </div>
        <h2 className="text-3xl font-extrabold text-foreground">Culinary creation not found</h2>
        <p className="text-slate-500 font-medium mt-3 max-w-md mx-auto">This dish might have been retired from our seasonal menu. Explore our latest arrivals instead.</p>
        <Button asChild className="mt-10 h-14 px-10 rounded-[16px] bg-[#377771] hover:bg-[#4CE0B3] text-white hover:text-emerald-950 font-bold shadow-lg transition-all active:scale-95">
          <Link href="/meals">Discover New Flavors</Link>
        </Button>
      </div>
    );
  }

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : null;

  const handleAddToCart = (qty = quantity, forceReplace = false) => {
    if (!meal.provider) {
      toast.error("Provider info is missing for this meal.");
      return;
    }

    const result = addToCart(meal, meal.provider as IProviderProfile, qty, {
      forceReplace,
    });

    if (result === "provider_mismatch" && !forceReplace) {
      setPendingQty(qty);
      setIsReplaceCartModalOpen(true);
      return;
    }

    toast.success(`${meal.title} added to your selection.`);
  };

  const handleConfirmReplaceCart = () => {
    setIsReplaceCartModalOpen(false);
    handleAddToCart(pendingQty, true);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background pb-32">
      {/* Immersive Header / Navigation */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
         <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/meals" className="group flex items-center text-sm font-bold text-slate-500 hover:text-[#ED6A5E] transition-colors">
               <ArrowLeft className="mr-3 h-5 w-5 transition-transform group-hover:-translate-x-1" /> Back to Menu
            </Link>
            <div className="flex items-center gap-4">
               <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted text-slate-500">
                  <Share2 className="h-5 w-5" />
               </Button>
               <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted text-slate-500">
                  <Heart className="h-5 w-5" />
               </Button>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 space-y-24">
        {/* Main Product Showcase */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Visual Showcase - Sticky on Desktop */}
          <div className="lg:col-span-7 lg:sticky lg:top-32">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1 }}
               className="relative aspect-[4/5] sm:aspect-square lg:aspect-auto lg:h-[700px] w-full rounded-[48px] overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-2xl group"
             >
                {meal.image ? (
                  <img src={meal.image} alt={meal.title} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 gap-4">
                     <ChefHat className="h-20 w-20 opacity-20" />
                     <p className="font-bold uppercase tracking-widest text-sm">Visuals coming soon</p>
                  </div>
                )}
                
                {/* Decorative Overlays */}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                
                <div className="absolute bottom-10 left-10 right-10">
                   <div className="flex flex-wrap gap-3 mb-4">
                      {meal.dietaryTag && meal.dietaryTag !== "NONE" && (
                        <Badge className="bg-[#4CE0B3] text-emerald-950 border-none px-4 py-1.5 rounded-full font-bold text-[11px] uppercase tracking-wider">
                           {meal.dietaryTag.replace("_", " ")}
                        </Badge>
                      )}
                      <Badge className="bg-white/20 backdrop-blur-md text-white border-white/20 px-4 py-1.5 rounded-full font-bold text-[11px] uppercase tracking-wider">
                         Freshly Prepared
                      </Badge>
                   </div>
                   <h2 className="text-4xl font-black text-white leading-tight">{meal.title}</h2>
                </div>
             </motion.div>
          </div>

          {/* Configuration & Details */}
          <div className="lg:col-span-5 space-y-12">
             <div className="reveal-up space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-2xl bg-[#ED6A5E]/10 flex items-center justify-center">
                      <Flame className="h-5 w-5 text-[#ED6A5E]" />
                   </div>
                   <span className="font-bold text-[#ED6A5E] uppercase tracking-[0.2em] text-xs">Trending Signature Dish</span>
                </div>
                
                <div className="space-y-4">
                   <div className="flex items-end justify-between gap-4">
                      <h1 className="text-5xl font-black tracking-tight text-foreground">{meal.title}</h1>
                      <div className="pb-1">
                         <span className="text-4xl font-black text-[#377771] dark:text-[#4CE0B3]">${meal.price.toFixed(2)}</span>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-900/50">
                         <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                         <span className="font-black text-amber-700 dark:text-amber-400">{averageRating || "New"}</span>
                      </div>
                      <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">{reviews.length} Experiences</span>
                      <div className="h-1 w-1 rounded-full bg-slate-300" />
                      <span className="text-slate-500 font-bold text-sm uppercase tracking-widest">{meal.category?.name || "Premium Selection"}</span>
                   </div>
                </div>

                <p className="text-xl text-slate-500 leading-relaxed font-medium italic border-l-4 border-[#FFAF87] pl-6 py-2">
                   "{meal.description || "A masterfully crafted culinary experience, prepared with seasonal ingredients and artistic precision."}"
                </p>
             </div>

             {/* Order Card */}
             <Card className="reveal-up rounded-[32px] border-border/50 shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-background overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-[#ED6A5E] via-[#FFAF87] to-[#4CE0B3]" />
                <CardContent className="p-10 space-y-10">
                   <div className="flex items-center justify-between">
                      <div className="space-y-1">
                         <p className="font-black text-lg text-foreground">Select Quantity</p>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Adjust to your appetite</p>
                      </div>
                      <div className="flex items-center rounded-2xl border border-border/50 bg-muted/30 p-1.5 gap-2">
                         <Button
                           type="button"
                           variant="ghost"
                           size="icon"
                           className="h-12 w-12 rounded-xl hover:bg-white transition-all text-slate-600"
                           onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                         >
                           <Minus className="h-5 w-5" />
                         </Button>
                         <span className="w-12 text-center font-black text-2xl text-foreground">{quantity}</span>
                         <Button
                           type="button"
                           variant="ghost"
                           size="icon"
                           className="h-12 w-12 rounded-xl hover:bg-white transition-all text-[#ED6A5E]"
                           onClick={() => setQuantity((prev) => prev + 1)}
                         >
                           <Plus className="h-5 w-5" />
                         </Button>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="flex justify-between items-center px-2">
                         <span className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Total Amount</span>
                         <span className="text-3xl font-black text-foreground">${(meal.price * quantity).toFixed(2)}</span>
                      </div>
                      
                      <Button
                        size="lg"
                        className="w-full h-16 rounded-[20px] bg-[#ED6A5E] hover:bg-[#FF8E72] text-white font-black text-lg shadow-[0_20px_40px_-10px_rgba(237,106,94,0.3)] transition-all hover:-translate-y-1 active:scale-95 group"
                        onClick={() => handleAddToCart()}
                        disabled={!meal.isAvailable}
                      >
                        <ShoppingCart className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                        {meal.isAvailable ? "Add to Order" : "Currently Unavailable"}
                      </Button>
                      
                      {!meal.isAvailable && (
                        <p className="text-center text-xs font-bold text-destructive uppercase tracking-widest">Check back during business hours</p>
                      )}
                   </div>
                </CardContent>
             </Card>

             {/* Restaurant Highlight */}
             <div className="reveal-up p-8 rounded-[32px] bg-muted/20 border border-border/50 flex items-center justify-between group cursor-pointer hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 rounded-[20px] bg-[#377771]/10 text-[#377771] flex items-center justify-center text-3xl font-black shadow-inner">
                      {meal.provider?.restaurantName?.charAt(0) || "F"}
                   </div>
                   <div>
                      <p className="text-xs font-bold text-[#ED6A5E] uppercase tracking-widest mb-1">Curated by</p>
                      <h4 className="font-black text-2xl text-foreground">{meal.provider?.restaurantName || "Premium Partner"}</h4>
                      <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                         <Star className="h-3.5 w-3.5 fill-[#FFAF87] text-[#FFAF87]" /> Excellence Certified
                      </p>
                   </div>
                </div>
                <Button asChild variant="ghost" size="icon" className="rounded-full group-hover:translate-x-2 transition-transform">
                   <Link href={`/restaurant/${meal.providerId}`}>
                      <Plus className="h-6 w-6" />
                   </Link>
                </Button>
             </div>

             {/* Trust Markers */}
             <div className="reveal-up grid grid-cols-2 gap-4">
                <div className="p-6 rounded-[24px] border border-border/50 bg-background flex flex-col gap-3">
                   <ShieldCheck className="h-6 w-6 text-[#4CE0B3]" />
                   <div>
                      <p className="font-black text-sm text-foreground">Safe Handling</p>
                      <p className="text-[11px] font-bold text-slate-400 uppercase">Certified Safety</p>
                   </div>
                </div>
                <div className="p-6 rounded-[24px] border border-border/50 bg-background flex flex-col gap-3">
                   <Zap className="h-6 w-6 text-[#ED6A5E]" />
                   <div>
                      <p className="font-black text-sm text-foreground">Priority Prep</p>
                      <p className="text-[11px] font-bold text-slate-400 uppercase">Ready in 20m</p>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* ─── Reviews ─── */}
        {reviews.length > 0 && (
          <ReviewSlider
            reviews={reviews}
            averageRating={averageRating}
            title="Guest Feedback"
            subtitle="Real experiences from our community"
          />
        )}

        {/* Global Cart Status Overlay - Minimalist */}
        {totalItems > 0 && (
           <motion.div 
             initial={{ y: 100, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-6"
           >
              <div className="bg-[#0A0F1E] text-white rounded-[24px] p-4 flex items-center justify-between shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-white/10 backdrop-blur-2xl">
                 <div className="flex items-center gap-4 px-2">
                    <div className="w-10 h-10 rounded-xl bg-[#ED6A5E] flex items-center justify-center shadow-lg shadow-[#ED6A5E]/20">
                       <ShoppingCart className="h-5 w-5" />
                    </div>
                    <div>
                       <p className="text-sm font-black">{totalItems} Items selected</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total: ${totalPrice.toFixed(2)}</p>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <Button variant="ghost" onClick={clearCart} className="h-11 rounded-xl font-bold text-slate-400 hover:bg-white/5">
                       Clear
                    </Button>
                    <Button onClick={() => router.push("/checkout")} className="h-11 px-8 rounded-xl bg-white text-[#0A0F1E] font-black hover:bg-[#4CE0B3] hover:text-emerald-950 transition-all">
                       Complete Order
                    </Button>
                 </div>
              </div>
           </motion.div>
        )}
      </div>

      {/* Cart Provider Mismatch Modal */}
      <Dialog open={isReplaceCartModalOpen} onOpenChange={setIsReplaceCartModalOpen}>
        <DialogContent aria-describedby="meal-replace-cart-desc" className="rounded-[40px] p-10 max-w-lg border-border/50 bg-background shadow-2xl">
          <DialogHeader className="space-y-6">
             <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto border border-amber-100">
                <ChefHat className="h-10 w-10 text-amber-500" />
             </div>
            <DialogTitle className="text-3xl font-black text-center text-foreground">Replace your selection?</DialogTitle>
            <DialogDescription id="meal-replace-cart-desc" className="text-lg text-slate-500 font-medium text-center leading-relaxed">
              Your cart currently showcases creations from <span className="text-[#ED6A5E] font-bold">{providerInfo?.restaurantName || "another partner"}</span>. 
              Selecting this dish will prioritize this kitchen and clear your previous choices.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-4 mt-10">
            <Button variant="ghost" onClick={() => setIsReplaceCartModalOpen(false)} className="h-14 rounded-2xl font-black text-slate-500 flex-1">
              Maintain Previous
            </Button>
            <Button onClick={handleConfirmReplaceCart} className="h-14 px-10 rounded-2xl bg-[#ED6A5E] hover:bg-[#FF8E72] text-white font-black shadow-lg shadow-[#ED6A5E]/20 flex-1">
              Prioritize This Kitchen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
