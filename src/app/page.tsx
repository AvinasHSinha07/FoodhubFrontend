"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

import HeroSection from "@/components/modules/Home/HeroSection";
import FeaturedCategories from "@/components/modules/Home/FeaturedCategories";
import FeaturedMeals from "@/components/modules/Home/FeaturedMeals";
import TopProviders from "@/components/modules/Home/TopProviders";
import Testimonials from "@/components/modules/Home/Testimonials";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow z-10 relative">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-3xl font-extrabold tracking-tight text-orange-600 flex items-center gap-2">
              <span className="bg-orange-600 text-white p-1 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </span>
              FoodHub
            </h1>
          </Link>
          <nav className="flex gap-4 items-center">
            <Button variant="ghost" asChild><Link href="/login">Login</Link></Button>
            <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white"><Link href="/register">Register</Link></Button>
            <Button variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50" asChild><Link href="/customer/orders">My Orders</Link></Button>
            <Button variant="ghost" asChild><Link href="/customer/profile">Profile</Link></Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full bg-white">
        <HeroSection />
        <FeaturedCategories />
        <FeaturedMeals />
        <TopProviders />
        <Testimonials />
      </main>
      
<footer className="bg-gray-900 text-white py-12 text-center mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gray-400">&copy; {new Date().getFullYear()} FoodHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

