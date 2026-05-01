"use client";

import Link from "next/link";
import { useMemo, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  ChefHat,
  Clock3,
  Heart,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Quote,
  TrendingUp,
  Zap,
  CheckCircle2,
  
  BrainCircuit,
  MessageCircleQuestion,
  Mail,
  User,
  ChevronDown,
  Plus,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { HomeServices } from "@/services/home.services";
import { FavoriteServices } from "@/services/favorite.services";
import { queryKeys } from "@/lib/query/query-keys";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FaMotorcycle } from "react-icons/fa";
import { useCart } from "@/providers/CartProvider";
import { IProviderProfile } from "@/types/user.types";
import { IMeal } from "@/types/meal.types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HomeSummaryPageClient() {
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const { addToCart, items, providerId: cartProviderId } = useCart();
  const [isReplaceCartModalOpen, setIsReplaceCartModalOpen] = useState(false);
  const [pendingMeal, setPendingMeal] = useState<IMeal | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.homeSummary(),
    queryFn: () => HomeServices.getHomeSummary(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: mealFavoritesResponse } = useQuery({
    queryKey: queryKeys.mealFavorites("home"),
    queryFn: () => FavoriteServices.getMealFavorites({ page: 1, limit: 100 }),
    staleTime: 1000 * 60,
    retry: false,
  });

  const { data: providerFavoritesResponse } = useQuery({
    queryKey: queryKeys.providerFavorites("home"),
    queryFn: () => FavoriteServices.getProviderFavorites({ page: 1, limit: 100 }),
    staleTime: 1000 * 60,
    retry: false,
  });

  const favoriteMealIds = useMemo(() => {
    return new Set(
      ((mealFavoritesResponse?.data || []) as any[])
        .map((favorite) => favorite.meal?.id)
        .filter(Boolean)
    );
  }, [mealFavoritesResponse?.data]);

  const favoriteProviderIds = useMemo(() => {
    return new Set(
      ((providerFavoritesResponse?.data || []) as any[])
        .map((favorite) => favorite.provider?.id)
        .filter(Boolean)
    );
  }, [providerFavoritesResponse?.data]);

  const toggleMealFavoriteMutation = useMutation({
    mutationFn: (mealId: string) => FavoriteServices.toggleMealFavorite(mealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-favorites"] });
      queryClient.invalidateQueries({ queryKey: ["meal-favorite-state"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Unable to update meal favorites.");
    },
  });

  const handleAddToOrder = (meal: any) => {
    // We need the provider info from the meal. 
    // In summary.featuredMeals, provider info is included.
    if (!meal.provider) {
      toast.error("Provider information missing.");
      return;
    }

    const result = addToCart(meal, meal.provider as IProviderProfile);

    if (result === "provider_mismatch") {
      setPendingMeal(meal);
      setIsReplaceCartModalOpen(true);
    } else {
      toast.success(`${meal.title} added to cart!`);
    }
  };

  const handleConfirmReplaceCart = () => {
    if (!pendingMeal) return;
    addToCart(pendingMeal, pendingMeal.provider as IProviderProfile, 1, { forceReplace: true });
    toast.success(`${pendingMeal.title} added to cart!`);
    setPendingMeal(null);
    setIsReplaceCartModalOpen(false);
  };

  const summary = data?.data;

  useEffect(() => {
    if (isLoading) return;
    
    const ctx = gsap.context(() => {
      const sections = document.querySelectorAll(".reveal-section");
      sections.forEach((section) => {
        gsap.fromTo(section, 
          { y: 60, opacity: 0 }, 
          { 
            y: 0, opacity: 1, 
            duration: 1, 
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
            }
          }
        );
      });

      // Hero Parallax
      gsap.to(".hero-blobs", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-container",
          start: "top top",
          end: "bottom top",
          scrub: true,
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-16 px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-[600px] w-full rounded-[32px] bg-slate-100 dark:bg-slate-900" />
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-[24px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="bg-background pb-32 overflow-hidden">
      {/* ─── HERO SECTION ─── */}
      <section className="hero-container relative min-h-[calc(100vh-5rem)] w-full overflow-hidden flex items-center bg-[#0A0F1E] text-white pt-20 lg:pt-0">

        {/* Background - Full Width Engine */}
        <div className="hero-blobs absolute inset-0 pointer-events-none w-full">
          <div className="absolute -top-1/4 -left-1/4 w-[1000px] h-[1000px] bg-[#ED6A5E] rounded-full blur-[220px] opacity-[0.12] animate-pulse" />
          <div className="absolute -bottom-1/4 -right-1/4 w-[1000px] h-[1000px] bg-[#377771] rounded-full blur-[220px] opacity-[0.18]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/40 via-transparent to-[#0A0F1E]/90" />
          
          {/* Noise overlay for premium feel */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>

        {/* Content - Professionally Aligned */}
        <div className="relative z-10 w-full px-6 sm:px-10 lg:px-20 xl:px-32 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center max-w-[1600px] mx-auto">

            {/* ── Left Content: Narrative ── */}
            <div className="flex flex-col items-start gap-12">

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-2xl shadow-xl"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-[#0A0F1E] bg-slate-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i + 15}`} alt="User" />
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4CE0B3]">Trusted by 24k+ foodies</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-6"
              >
                <h1 className="text-6xl sm:text-7xl xl:text-[5.5rem] font-black tracking-tight leading-[0.95] text-white">
                  Savor the <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ED6A5E] via-[#FFAF87] to-[#4CE0B3]">
                    Extraordinary
                  </span>
                </h1>
                <p className="max-w-xl text-xl text-slate-400 font-medium leading-relaxed italic opacity-80 border-l-2 border-[#4CE0B3]/30 pl-6">
                  "Experience a masterfully curated marketplace where world-class kitchens meet your doorstep with artistic precision."
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-wrap items-center gap-6"
              >
                <Button asChild size="lg" className="h-16 px-10 rounded-[20px] bg-[#ED6A5E] hover:bg-[#FF8E72] text-white font-black text-sm uppercase tracking-widest transition-all hover:-translate-y-1.5 shadow-[0_20px_40px_-10px_rgba(237,106,94,0.4)] group">
                  <Link href="/meals">
                    Explore Menu <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="h-16 px-10 rounded-[20px] border border-white/10 text-white font-black text-sm uppercase tracking-widest hover:bg-white/5 transition-all">
                  <Link href="/restaurants">The Kitchens</Link>
                </Button>
              </motion.div>

              {/* Sophisticated Metrics Bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="flex items-center gap-12 pt-8 border-t border-white/10 w-full"
              >
                <div className="space-y-1">
                  <p className="text-3xl font-black text-white">200+</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Top Chefs</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="space-y-1">
                  <p className="text-3xl font-black text-[#4CE0B3]">18m</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg. Time</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="space-y-1">
                  <p className="text-3xl font-black text-white">4.9/5</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rating</p>
                </div>
              </motion.div>
            </div>

            {/* ── Right Content: Visual Centerpiece ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:flex justify-center items-center"
            >
              <div className="relative w-full aspect-square max-w-[550px] group">
                {/* Visual Depth Elements */}
                <div className="absolute inset-0 rounded-full border border-white/5 animate-spin-slow opacity-30" />
                <div className="absolute inset-10 rounded-full border border-dashed border-white/10 opacity-40" />
                
                {/* The Main Plate Showcase */}
                <div className="absolute inset-16 rounded-full overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/20 transition-transform duration-700 group-hover:scale-105">
                  <img
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000"
                    alt="Signature Dish"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-transparent to-transparent opacity-60" />
                </div>

                {/* Floating Meta Module */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-10 -right-4 bg-white/5 backdrop-blur-3xl border border-white/10 p-6 rounded-[32px] shadow-2xl z-20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#4CE0B3]/20 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-[#4CE0B3]" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white italic">Chef's Special</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Heritage Wagyu</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Scroll Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 pointer-events-none"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/25">Explore</p>
          <div className="h-10 w-px bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>
      </section>

      <div className="mx-auto max-w-[1400px] space-y-32 px-4 sm:px-6 lg:px-8 mt-32">

      {/* 2. TRUST METRICS */}
      <section className="reveal-section grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Users", value: "50K+", icon: User },
          { label: "Restaurants", value: "200+", icon: ChefHat },
          { label: "Positive Reviews", value: "99%", icon: Star },
          { label: "Fast Delivery", value: "<30m", icon: Clock3 },
        ].map((metric, i) => (
          <div key={i} className="flex flex-col items-center justify-center p-8 rounded-[24px] bg-muted/30 border border-border/50 text-center">
            <h4 className="text-4xl font-extrabold text-[#377771] dark:text-[#4CE0B3] mb-2">{metric.value}</h4>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{metric.label}</p>
          </div>
        ))}
      </section>

      {/* 3. POPULAR CATEGORIES */}
      <section className="reveal-section space-y-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#ED6A5E]">Taste the world</p>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-foreground">
              Popular Categories
            </h2>
          </div>
          <Link href="/meals" className="group flex items-center text-sm font-bold text-slate-500 hover:text-[#ED6A5E] transition-colors">
            See all <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {!summary?.featuredCategories?.length ? (
          <div className="p-16 text-center text-slate-500 bg-muted/20 rounded-[24px]">No categories found.</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {summary.featuredCategories.map((cat: any) => (
              <Link key={cat.id} href={`/meals?categoryId=${cat.id}`}>
                <Card className="group h-full border border-border/50 bg-background transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(237,106,94,0.1)] hover:border-[#ED6A5E]/30">
                  <CardContent className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
                    <div className="h-16 w-16 rounded-full bg-[#FFAF87]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Sparkles className="text-[#ED6A5E]" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{cat.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{cat._count?.meals || 0} items</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 4. FEATURED MEALS */}
      <section className="reveal-section space-y-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#ED6A5E]">Editor Picks</p>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-foreground">
              Featured Meals
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {summary?.featuredMeals?.map((meal: any) => (
            <Card key={meal.id} className="group overflow-hidden border border-border/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_60px_rgba(255,255,255,0.03)] bg-background">
              <Link href={`/meals/${meal.id}`} className="block relative pt-[85%] overflow-hidden bg-slate-100 dark:bg-slate-800">
                {meal.image && (
                  <img src={meal.image} alt={meal.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Favorite Toggle Overlay */}
                <div className="absolute right-4 top-4 z-10">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full bg-white/90 backdrop-blur-sm hover:bg-white border-none shadow-lg"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleMealFavoriteMutation.mutate(meal.id);
                    }}
                  >
                    <Heart className={`h-5 w-5 ${favoriteMealIds.has(meal.id) ? "fill-[#ED6A5E] text-[#ED6A5E]" : "text-slate-400"}`} />
                  </Button>
                </div>

                <div className="absolute bottom-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                   <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest">
                      View Recipe Details
                   </div>
                </div>
              </Link>
              
              <CardContent className="p-6">
                <Link href={`/meals/${meal.id}`} className="block group/title">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-foreground line-clamp-1 group-hover/title:text-[#ED6A5E] transition-colors">{meal.title}</h3>
                    <span className="font-extrabold text-[#377771] dark:text-[#4CE0B3]">${Number(meal.price).toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-6 font-medium leading-relaxed">{meal.description}</p>
                </Link>
                
                <Button 
                  className="w-full h-12 rounded-[14px] bg-[#ED6A5E] hover:bg-[#FF8E72] text-white font-bold shadow-md hover:-translate-y-1 transition-all active:scale-95"
                  onClick={() => handleAddToOrder(meal)}
                >
                  <Plus className="mr-2 h-5 w-5" /> Add to Order
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. TRENDING RESTAURANTS */}
      <section className="reveal-section space-y-10">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#ED6A5E]">Top Rated</p>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground">Trending Restaurants</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {summary?.topProviders?.slice(0, 3).map((provider: any) => (
            <Card key={provider.id} className="border border-border/50 hover:border-[#377771]/30 transition-all duration-300">
              <CardContent className="p-8 flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <div className="h-16 w-16 rounded-[16px] bg-[#377771]/10 dark:bg-[#4CE0B3]/10 text-[#377771] dark:text-[#4CE0B3] flex items-center justify-center text-2xl font-bold">
                      {provider.restaurantName?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">{provider.restaurantName}</h3>
                      <div className="flex items-center gap-1 text-sm font-medium text-slate-500 mt-1">
                        <Star className="h-4 w-4 fill-[#FFAF87] text-[#FFAF87]" /> {provider.averageRating || "4.9"}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-slate-500 text-sm line-clamp-2">{provider.description || "The best culinary experience in town."}</p>
                <Button asChild variant="outline" className="w-full border-border/50">
                  <Link href={`/restaurant/${provider.id}`}>Visit Kitchen</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 6. WHY CHOOSE FOODHUB & 7. HOW IT WORKS */}
      <section className="reveal-section grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#ED6A5E]">Why Choose Us</p>
          <h2 className="text-4xl font-extrabold text-foreground leading-tight">Premium delivery without the compromise.</h2>
          <div className="space-y-6">
            {[
              { title: "Curated Selection", desc: "We only partner with top-rated local restaurants.", icon: ShieldCheck },
              { title: "Lightning Fast", desc: "Optimized routing ensures your food arrives hot.", icon: Zap },
              { title: "Smart Recommendations", desc: "Our AI learns your taste to suggest perfect meals.", icon: BrainCircuit }
            ].map((feature, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-12 w-12 shrink-0 rounded-[16px] bg-[#FFAF87]/20 text-[#ED6A5E] flex items-center justify-center">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{feature.title}</h4>
                  <p className="text-slate-500 text-sm mt-1">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#377771] dark:bg-slate-900 rounded-[32px] p-12 text-white shadow-2xl relative overflow-hidden border border-transparent dark:border-slate-800">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#4CE0B3]/20 blur-3xl rounded-full"></div>
           <h3 className="text-3xl font-bold mb-8 relative z-10">How it works</h3>
           <div className="space-y-8 relative z-10">
             {[
               { step: "01", text: "Browse premium menus" },
               { step: "02", text: "Secure one-tap checkout" },
               { step: "03", text: "Track delivery in real-time" }
             ].map((item, i) => (
               <div key={i} className="flex items-center gap-6">
                 <span className="text-4xl font-extrabold text-[#4CE0B3]/50">{item.step}</span>
                 <p className="text-xl font-medium">{item.text}</p>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* 8. AI RECOMMENDATION SECTION */}
      <section className="reveal-section relative rounded-[32px] overflow-hidden bg-muted/30 border border-border/50 p-12 lg:p-20 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="mx-auto w-16 h-16 bg-[#ED6A5E]/10 text-[#ED6A5E] rounded-full flex items-center justify-center mb-6">
            <BrainCircuit className="h-8 w-8" />
          </div>
          <h2 className="text-4xl font-extrabold text-foreground">Smart Taste Profiling</h2>
          <p className="text-lg text-slate-500">
            Our intelligent algorithms analyze your past orders to recommend new dishes and hidden gems you are guaranteed to love.
          </p>
          <Button asChild className="mt-4 rounded-[14px] bg-[#377771] dark:bg-[#4CE0B3] hover:bg-[#2c615c] dark:hover:bg-[#4CE0B3]/90 text-white dark:text-emerald-950 px-8 h-12 font-bold">
            <Link href="/register">Build Your Profile</Link>
          </Button>
        </div>
      </section>

      {/* 9. DELIVERY EXPERIENCE & 10. REVIEWS */}
      <section className="reveal-section grid lg:grid-cols-2 gap-16">
        <div className="bg-slate-100 dark:bg-slate-900 rounded-[32px] p-12 flex flex-col justify-center border border-border/50">
          <FaMotorcycle className="h-12 w-12 text-[#ED6A5E] mb-6" />
          <h3 className="text-3xl font-bold mb-4">Flawless Delivery Experience</h3>
          <p className="text-slate-500 mb-8">Watch your order arrive in real-time. Our professional delivery partners ensure your premium meals are handled with care.</p>
          <div className="p-4 rounded-[16px] bg-white dark:bg-slate-800 shadow-sm border border-border/50 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-[#4CE0B3]/20 flex items-center justify-center text-[#377771] dark:text-[#4CE0B3]"><CheckCircle2 className="h-5 w-5"/></div>
            <div>
              <p className="font-bold text-sm">Order #8821 Arriving</p>
              <p className="text-xs text-slate-500">Driver is 2 minutes away</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col justify-center space-y-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#ED6A5E]">Testimonials</p>
            <h2 className="text-4xl font-extrabold mt-2">Loved by thousands.</h2>
          </div>
          <Card className="border-0 shadow-lg shadow-[#377771]/5 bg-background relative overflow-visible mt-6">
            <Quote className="absolute -top-6 -left-6 h-12 w-12 text-[#FFAF87]/50" />
            <CardContent className="p-8">
              <div className="flex text-[#ED6A5E] mb-4">
                <Star className="fill-current h-5 w-5" /><Star className="fill-current h-5 w-5" /><Star className="fill-current h-5 w-5" /><Star className="fill-current h-5 w-5" /><Star className="fill-current h-5 w-5" />
              </div>
              <p className="text-lg font-medium text-slate-700 dark:text-slate-300 italic mb-6">"FoodHub completely changed how we order dinner. The curation is incredible, and the app feels so premium compared to everything else."</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#377771] dark:bg-[#4CE0B3] text-white dark:text-emerald-950 flex items-center justify-center font-bold">S</div>
                <div>
                  <p className="font-bold text-sm">Sarah Jenkins</p>
                  <p className="text-xs text-slate-500">Pro Member</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 11. RESTAURANT PARTNER CTA */}
      <section className="reveal-section rounded-[32px] bg-gradient-to-br from-[#377771] to-[#1F4541] dark:from-[#0F172A] dark:to-[#1E293B] dark:border dark:border-slate-800 p-12 lg:p-20 text-white flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl">
        <div className="max-w-xl">
          <h2 className="text-4xl font-extrabold mb-4">Grow your restaurant with FoodHub.</h2>
          <p className="text-[#4CE0B3] text-lg mb-8">Access thousands of premium customers and manage your business with our top-tier provider dashboard.</p>
          <Button asChild className="bg-white text-[#377771] hover:bg-slate-100 dark:bg-slate-800 dark:text-[#4CE0B3] dark:hover:bg-slate-700 h-14 px-8 rounded-[14px]">
            <Link href="/register?role=PROVIDER">Partner With Us</Link>
          </Button>
        </div>
        <div className="hidden lg:flex gap-4">
           {/* Abstract dashboard graphic */}
           <div className="w-48 h-64 bg-white/10 rounded-[24px] backdrop-blur-md border border-white/20 p-4 space-y-4">
             <div className="h-4 w-1/2 bg-white/30 rounded-full"></div>
             <div className="h-20 bg-[#ED6A5E]/80 rounded-[12px]"></div>
             <div className="h-20 bg-[#FFAF87]/80 rounded-[12px]"></div>
           </div>
        </div>
      </section>

      {/* 12. FAQ SECTION - Using Shadcn Accordion */}
      <section className="reveal-section max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#ED6A5E]">Help Center</p>
          <h2 className="text-5xl font-black tracking-tight text-foreground">Frequently Asked Questions</h2>
        </div>
        
        <Accordion type="single" collapsible className="w-full space-y-4">
          {[
            { 
              q: "How fast is the delivery?", 
              a: "Most orders arrive within 30-45 minutes depending on the restaurant's preparation time and your distance. You can track your rider in real-time." 
            },
            { 
              q: "How do I track my order?", 
              a: "Once your order is confirmed, you'll receive a notification. You can monitor the status from 'My Orders' in your dashboard, showing kitchen preparation and rider progress." 
            },
            { 
              q: "Are there any subscription benefits?", 
              a: "Yes! FoodHub Pro members enjoy zero delivery fees on orders over $15, exclusive early access to secret menus, and double rewards points on every purchase." 
            },
            { 
              q: "What if there is an issue with my order?", 
              a: "Our customer support team is available 24/7. You can report an issue directly through the order details page or start a live chat with our support agents." 
            }
          ].map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border border-border/50 bg-muted/20 rounded-[20px] px-6 overflow-hidden data-[state=open]:bg-background transition-all">
              <AccordionTrigger className="text-lg font-bold py-6 hover:no-underline text-foreground">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-slate-500 font-medium text-base leading-relaxed pb-6">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Cart Provider Mismatch Modal */}
      <Dialog open={isReplaceCartModalOpen} onOpenChange={setIsReplaceCartModalOpen}>
        <DialogContent className="rounded-[32px] border-border/50 bg-background p-8 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-foreground">Replace Current Cart?</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Your cart already contains items from <span className="text-[#ED6A5E] font-bold">{items[0]?.meal?.provider?.restaurantName || "another restaurant"}</span>. 
              Adding this will clear your current selections.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-0 mt-6">
            <Button variant="ghost" onClick={() => setIsReplaceCartModalOpen(false)} className="h-12 rounded-[14px] font-bold text-slate-500">
              Cancel
            </Button>
            <Button onClick={handleConfirmReplaceCart} className="h-12 px-8 rounded-[14px] bg-[#ED6A5E] hover:bg-[#FF8E72] text-white font-bold shadow-md">
              Replace and Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 13. NEWSLETTER CTA */}
      <section className="reveal-section rounded-[32px] bg-[#ED6A5E] p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-[#ED6A5E]/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFAF87] rounded-full blur-[100px]"></div>
        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
          <Mail className="h-12 w-12 mx-auto text-white/80" />
          <h2 className="text-5xl font-extrabold tracking-tight">Stay hungry. Stay updated.</h2>
          <p className="text-xl text-white/90">Join our newsletter for exclusive restaurant drops, secret menus, and special offers.</p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto bg-white/20 p-2 rounded-[20px] backdrop-blur-md border border-white/20">
            <input type="email" placeholder="Enter your email" className="bg-transparent border-none outline-none text-white placeholder:text-white/60 px-4 w-full min-h-11" />
            <Button className="rounded-[14px] bg-white text-[#ED6A5E] hover:bg-slate-100">Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  </div>
  );
}