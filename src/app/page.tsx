import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { ArrowRight, Leaf, ShieldCheck, Truck, Utensils, Star, Store, MapPin } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans transition-all" style={{ fontFamily: "var(--font-sora)" }}>
      <Navbar />

      <main className="flex-1">
        {/* Dynamic Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40 bg-slate-900 border-b border-slate-800">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-[20%] left-[-10%] w-[600px] h-[600px] bg-orange-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-60 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-10 blur-xl opacity-20 mask-image:linear-gradient(to_bottom,transparent,black)"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge className="mb-8 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30 px-4 py-1.5 text-sm backdrop-blur-md shadow-lg shadow-orange-500/10">
             ?? The smartest way to eat locally
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-extrabold tracking-tight text-white mb-8 drop-shadow-md">
              Extraordinary Meals.<br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-indigo-400">
                Delivered Faster.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed text-slate-300 font-medium">
              FoodHub connects food lovers with top local providers. From gourmet restaurants to amazing home kitchens, your next favorite dish is just a click away.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto h-16 px-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-lg shadow-xl shadow-orange-500/30 hover:-translate-y-1 transition-all duration-300 border-none">
                <Link href="/meals">
                  Order Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto h-16 px-10 rounded-full border-slate-700 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 hover:text-white font-bold text-lg shadow-xl transition-all duration-300">
                <Link href="/restaurants">
                  Browse Restaurants
                </Link>
              </Button>
            </div>
            
            <div className="mt-16 flex items-center justify-center gap-8 text-slate-400 text-sm font-medium">
               <div className="flex items-center"><Star className="w-4 h-4 text-yellow-500 mr-2" /> 4.9/5 Average Rating</div>
               <div className="flex items-center"><Truck className="w-4 h-4 text-orange-400 mr-2" /> Fast Delivery</div>
               <div className="hidden md:flex items-center"><Store className="w-4 h-4 text-indigo-400 mr-2" /> Top Quality Vendors</div>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-24 bg-white relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
               <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-4">Why choose <span className="text-orange-600">FoodHub?</span></h2>
               <p className="text-slate-500 max-w-2xl mx-auto text-lg">We're reimagining the food delivery experience from the kitchen to your front door.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="group bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-100 mb-8 border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                  <Leaf className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Curated Menus</h3>
                <p className="text-slate-500 leading-relaxed">Browse trusted providers with quality-first meal listings, high-resolution imagery, and crystal-clear dietary information.</p>
              </div>
              <div className="group bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-pink-100 mb-8 border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                  <Truck className="w-8 h-8 text-pink-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Reliable Delivery</h3>
                <p className="text-slate-500 leading-relaxed">Track every order from placement to delivery with transparent status updates and real-time order monitoring.</p>
              </div>
              <div className="group bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 mb-8 border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Secure Payments</h3>
                <p className="text-slate-500 leading-relaxed">Checkout with confidence using our 100% verified payment flows, robust data protection, and secure session handling.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-24 bg-orange-600 relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
           <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
              <h2 className="text-4xl sm:text-6xl font-black text-white mb-6 drop-shadow-lg">Ready to satisfy your cravings?</h2>
              <p className="text-orange-100 text-xl mb-10 max-w-2xl mx-auto">Join thousands of customers discovering amazing food locally. Create an account today and get exploring!</p>
              <Button asChild size="lg" className="bg-white text-orange-600 hover:bg-slate-100 px-10 h-16 rounded-full font-bold text-lg shadow-2xl hover:-translate-y-1 transition-all">
                <Link href="/meals">Discover Menu Now</Link>
              </Button>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
