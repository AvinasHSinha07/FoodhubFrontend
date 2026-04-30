"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProviderProfileServices } from "@/services/providerProfile.services";
import { FavoriteServices } from "@/services/favorite.services";
import { IProviderProfile } from "@/types/user.types";
import { queryKeys } from "@/lib/query/query-keys";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  Utensils, 
  Star, 
  ArrowRight, 
  Heart, 
  TrendingUp, 
  Sparkles, 
  Clock, 
  ChevronRight,
  Filter,
  CheckCircle2
} from "lucide-react";
import PaginationControls from "@/components/shared/list/PaginationControls";
import SortControl from "@/components/shared/list/SortControl";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function RestaurantsPageClient() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  const queryString = searchParams?.toString() || "";
  const searchValueFromUrl = searchParams?.get("search")?.trim() || "";

  const [searchTerm, setSearchTerm] = useState(searchValueFromUrl);
  const [sortValue, setSortValue] = useState(
    `${searchParams?.get("sortBy") || "createdAt"}:${searchParams?.get("sortOrder") || "desc"}`
  );

  useEffect(() => {
    setSearchTerm(searchValueFromUrl);
    setSortValue(`${searchParams?.get("sortBy") || "createdAt"}:${searchParams?.get("sortOrder") || "desc"}`);
  }, [searchValueFromUrl]);

  const page = Number(searchParams?.get("page") || "1");
  const [sortBy, sortOrder] = sortValue.split(":");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.providers(queryString),
    queryFn: () =>
      ProviderProfileServices.getAllProviders({
        searchTerm: searchValueFromUrl || undefined,
        page,
        limit: 9,
        sortBy,
        sortOrder: (sortOrder as "asc" | "desc") || "desc",
      }),
    staleTime: 1000 * 60 * 10,
  });

  const providers = data?.data || [];
  const providersMeta = data?.meta;

  const { data: providerFavoritesResponse } = useQuery({
    queryKey: queryKeys.providerFavorites("restaurants-page"),
    queryFn: () => FavoriteServices.getProviderFavorites({ page: 1, limit: 100 }),
    staleTime: 1000 * 60,
    retry: false,
  });

  const favoriteProviderIds = useMemo(() => {
    return new Set(
      ((providerFavoritesResponse?.data || []) as any[])
        .map((favorite) => favorite.provider?.id)
        .filter(Boolean)
    );
  }, [providerFavoritesResponse?.data]);

  useEffect(() => {
    if (!isLoading && providers.length > 0) {
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
            start: "top 85%",
          }
        }
      );
    }
  }, [isLoading, providers]);

  const toggleProviderFavoriteMutation = useMutation({
    mutationFn: (providerId: string) => FavoriteServices.toggleProviderFavorite(providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-favorites"] });
      queryClient.invalidateQueries({ queryKey: ["provider-favorite-state"] });
    },
    onError: (mutationError: unknown) => {
      toast.error(getApiErrorMessage(mutationError, "Unable to update favorites."));
    },
  });

  const filteredProviders = useMemo(() => {
    if (!searchValueFromUrl) return providers;
    return providers.filter(
      (provider: IProviderProfile) =>
        provider.restaurantName.toLowerCase().includes(searchValueFromUrl.toLowerCase()) ||
        (provider.cuisineType &&
          provider.cuisineType.toLowerCase().includes(searchValueFromUrl.toLowerCase()))
    );
  }, [providers, searchValueFromUrl]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextParams = new URLSearchParams(searchParams?.toString());
    if (searchTerm.trim()) {
      nextParams.set("search", searchTerm.trim());
    } else {
      nextParams.delete("search");
    }
    const nextQueryString = nextParams.toString();
    router.replace(nextQueryString ? `${pathname}?${nextQueryString}` : pathname, { scroll: false });
  };

  const updateParams = (updates: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams?.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) nextParams.delete(key);
      else nextParams.set(key, value);
    });
    const nextQueryString = nextParams.toString();
    router.replace(nextQueryString ? `${pathname}?${nextQueryString}` : pathname, { scroll: false });
  };

  const handleSortChange = (value: string) => {
    setSortValue(value);
    const [nextSortBy, nextSortOrder] = value.split(":");
    updateParams({ sortBy: nextSortBy, sortOrder: nextSortOrder, page: "1" });
  };

  const handlePageChange = (nextPage: number) => {
    updateParams({ page: String(nextPage) });
  };

  return (
    <div ref={containerRef} className="bg-background min-h-screen pb-32">
      {/* Cinematic Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-36 overflow-hidden">
        <div className="absolute inset-0 z-0">
           <div className="absolute top-0 left-0 w-full h-full bg-[#0A0F1E]" />
           <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#ED6A5E]/10 rounded-full blur-[120px] animate-pulse" />
           <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#377771]/15 rounded-full blur-[120px]" />
           <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
           <div 
             className="absolute inset-0 bg-cover bg-center opacity-20 grayscale scale-110" 
             style={{ backgroundImage: `url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=2000')` }} 
           />
           <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E] via-transparent to-background" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center space-y-10">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl"
           >
              <Sparkles className="h-4 w-4 text-[#4CE0B3]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">Heritage Collection 2026</span>
           </motion.div>

           <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.1 }}
             className="text-6xl sm:text-8xl font-black tracking-tighter text-white leading-[0.9]"
           >
             Curated <br /> 
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ED6A5E] via-[#FFAF87] to-[#4CE0B3]">Culinary Gems</span>
           </motion.h1>

           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.2 }}
             className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed italic"
           >
             "Discover a world where every plate tells a story and every kitchen is a masterpiece of local tradition."
           </motion.p>

           <motion.form 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.3 }}
             onSubmit={handleSearch} 
             className="max-w-3xl mx-auto relative group pt-8"
           >
              <div className="absolute -inset-2 bg-gradient-to-r from-[#ED6A5E] to-[#4CE0B3] rounded-[32px] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="relative flex items-center bg-[#0F172A]/80 backdrop-blur-3xl rounded-[32px] border border-white/10 p-3 shadow-2xl overflow-hidden">
                 <div className="px-6 border-r border-white/5">
                    <Search className="h-6 w-6 text-slate-500" />
                 </div>
                 <Input
                   placeholder="Seek your next signature experience..."
                   className="flex-1 bg-transparent border-none text-white placeholder:text-slate-500 text-xl font-medium h-14 focus-visible:ring-0"
                   value={searchTerm}
                   onChange={(event) => setSearchTerm(event.target.value)}
                 />
                 <Button type="submit" className="h-14 px-10 rounded-[22px] bg-white text-[#0A0F1E] hover:bg-[#4CE0B3] hover:text-emerald-950 font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl">
                   Discover
                 </Button>
              </div>
           </motion.form>
        </div>
      </section>

      {/* Grid Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16 bg-background/50 backdrop-blur-xl p-4 rounded-[28px] border border-border/50 shadow-xl">
           <div className="flex items-center gap-4 px-4">
              <Filter className="h-5 w-5 text-slate-400" />
              <div className="space-y-0.5">
                 <p className="text-xs font-black uppercase tracking-widest text-slate-500">Inventory Status</p>
                 <p className="text-sm font-bold text-foreground">{providersMeta?.total || 0} Registered Partners</p>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <SortControl
                value={sortValue}
                onValueChange={handleSortChange}
                options={[
                  { label: "Newest Arrivals", value: "createdAt:desc" },
                  { label: "Heritage Partners", value: "createdAt:asc" },
                  { label: "Alphabetical: A-Z", value: "restaurantName:asc" },
                  { label: "Alphabetical: Z-A", value: "restaurantName:desc" },
                ]}
              />
           </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-muted/10 rounded-[40px] p-6 space-y-6 animate-pulse border border-border/50">
                <Skeleton className="h-64 w-full rounded-[32px]" />
                <div className="space-y-3">
                   <Skeleton className="h-8 w-3/4 rounded-lg" />
                   <Skeleton className="h-4 w-1/2 rounded-lg" />
                </div>
                <Skeleton className="h-16 w-full rounded-[20px]" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-40 rounded-[60px] border-2 border-dashed border-destructive/20 bg-destructive/5 max-w-4xl mx-auto">
            <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <Search className="w-10 h-10 text-destructive" />
            </div>
            <h3 className="text-3xl font-black text-foreground mb-4">Inventory Synch Failed</h3>
            <p className="text-slate-500 text-lg font-medium max-w-md mx-auto">{getApiErrorMessage(error, "Please refresh to synchronize culinary data.")}</p>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-40 rounded-[60px] border-2 border-dashed border-border/50 bg-muted/5 max-w-4xl mx-auto">
            <div className="w-24 h-24 bg-[#377771]/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <Utensils className="w-10 h-10 text-[#377771]" />
            </div>
            <h3 className="text-3xl font-black text-foreground mb-4">No culinary hits found</h3>
            <p className="text-slate-500 text-lg font-medium max-w-md mx-auto">Our current curation doesn't match your specific criteria. Try a broader search.</p>
            <Button
              onClick={() => {
                setSearchTerm("");
                router.replace(pathname, { scroll: false });
              }}
              className="mt-10 h-14 px-12 rounded-[18px] bg-[#377771] text-white font-bold transition-all shadow-xl"
            >
              Reset Discovery
            </Button>
          </div>
        ) : (
          <div className="reveal-container space-y-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredProviders.map((provider) => {
                const reviews = provider.meals?.flatMap((meal: any) => meal.reviews || []) || [];
                const averageRating = reviews.length > 0
                  ? (reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / reviews.length).toFixed(1)
                  : "New";
                const reviewCount = reviews.length;

                return (
                  <Card key={provider.id} className="reveal-up group relative overflow-hidden rounded-[40px] border-border/50 bg-background shadow-lg hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 flex flex-col h-full border hover:border-[#377771]/30">
                    <div className="relative h-72 overflow-hidden bg-slate-100 dark:bg-slate-900">
                      <img
                        src={provider.bannerImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800"}
                        alt={provider.restaurantName}
                        className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110 group-hover:rotate-1"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-[#0A0F1E]/20 to-transparent opacity-80" />
                      
                      <div className="absolute bottom-6 left-6 flex items-center gap-4">
                         <div className="relative">
                            <div className="absolute -inset-1.5 bg-gradient-to-tr from-[#ED6A5E] to-[#4CE0B3] rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
                            {provider.logo ? (
                              <img src={provider.logo} alt="Logo" className="relative w-16 h-16 rounded-2xl border-4 border-background bg-white object-cover shadow-2xl" />
                            ) : (
                              <div className="relative w-16 h-16 rounded-2xl border-4 border-background bg-slate-100 flex items-center justify-center">
                                <Utensils className="h-6 w-6 text-slate-300" />
                              </div>
                            )}
                         </div>
                         <div className="text-white">
                            <h3 className="font-black text-xl tracking-tight leading-none group-hover:text-[#ED6A5E] transition-colors">{provider.restaurantName}</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mt-1.5">{provider.cuisineType || "Heritage Kitchen"}</p>
                         </div>
                      </div>

                      <div className="absolute top-6 right-6 flex gap-2">
                        <Badge className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border-none shadow-xl backdrop-blur-xl ${provider.isOpenNow ? "bg-[#4CE0B3] text-emerald-950" : "bg-destructive text-white"}`}>
                          {provider.isOpenNow ? "Active Now" : "Currently Offline"}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-8 space-y-8 flex flex-col flex-1">
                      <div className="flex justify-between items-start gap-4">
                         <div className="space-y-4 flex-1">
                            <div className="flex items-center gap-6">
                               <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-900/50">
                                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                  <span className="font-black text-sm text-amber-700 dark:text-amber-400">{averageRating}</span>
                               </div>
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{reviewCount} Reviews</span>
                            </div>
                            <p className="text-slate-500 font-medium leading-relaxed italic line-clamp-2">
                               "{provider.description || "A masterfully curated culinary experience defined by local tradition and seasonal excellence."}"
                            </p>
                         </div>
                         <Button
                           type="button"
                           variant="ghost"
                           size="icon"
                           className="h-12 w-12 rounded-2xl hover:bg-muted"
                           onClick={() => toggleProviderFavoriteMutation.mutate(provider.id)}
                         >
                           <Heart className={`h-6 w-6 transition-colors ${favoriteProviderIds.has(provider.id) ? "fill-[#ED6A5E] text-[#ED6A5E]" : "text-slate-300 hover:text-[#ED6A5E]"}`} />
                         </Button>
                      </div>

                      <div className="space-y-4 pt-6 border-t border-border/30">
                         <div className="flex items-center gap-3 text-slate-500">
                            <MapPin className="h-4 w-4 text-[#ED6A5E]" />
                            <span className="text-xs font-bold truncate">{provider.address || "Heritage Hub"}</span>
                         </div>
                         <div className="flex items-center gap-3 text-slate-500">
                            <Clock className="h-4 w-4 text-[#4CE0B3]" />
                            <span className="text-xs font-bold">{provider.estimatedReadyInMinutes || 30}m Ready Time</span>
                         </div>
                      </div>

                      <Button asChild className="w-full h-16 rounded-[22px] bg-[#0A0F1E] dark:bg-white text-white dark:text-[#0A0F1E] hover:bg-[#ED6A5E] dark:hover:bg-[#ED6A5E] dark:hover:text-white font-black text-sm uppercase tracking-widest transition-all hover:-translate-y-1 active:scale-95 shadow-xl group/btn">
                        <Link href={`/restaurant/${provider.id}`}>
                           View Collections <ArrowRight className="ml-3 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <div className="pt-20 flex justify-center">
               <PaginationControls meta={providersMeta} onPageChange={handlePageChange} isLoading={isLoading} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
