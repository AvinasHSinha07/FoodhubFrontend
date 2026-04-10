import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <div className="relative bg-gray-900 text-white py-32 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"
          alt="Delicious Food"
          className="w-full h-full object-cover opacity-40"
        />
      </div>
      <div className="relative max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Delicious Meals Delivered to Your Door
        </h1>
        <p className="text-lg md:text-2xl mb-10 max-w-3xl mx-auto text-gray-200">
          Discover top-rated local restaurants. Fast, fresh, and delivered hot right when you need it.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white font-bold" asChild>
            <Link href="/meals">Browse Meals</Link>
          </Button>
          <Button size="lg" variant="outline" className="text-orange-100 border-orange-100 hover:bg-orange-900" asChild>
            <Link href="/restaurants">Find Restaurants</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}