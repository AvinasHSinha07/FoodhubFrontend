import Link from "next/link";
import { Truck } from "lucide-react";
import { Sora } from "next/font/google";

const sora = Sora({ subsets: ["latin"], weight: ["700", "800"] });

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center justify-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white shadow-sm">
              <Truck className="h-5 w-5" />
            </span>
            <span className="text-2xl font-extrabold text-white">
              FoodHub
            </span>
          </div>
          <div className="flex gap-6 text-sm font-medium">
            <Link href="/meals" className="hover:text-orange-400 transition-colors">Meals</Link>
            <Link href="/restaurants" className="hover:text-orange-400 transition-colors">Restaurants</Link>
            <Link href="/login" className="hover:text-orange-400 transition-colors">Login</Link>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} FoodHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
