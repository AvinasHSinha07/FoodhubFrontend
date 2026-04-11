"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Settings, User, ShoppingBag, PieChart, ChefHat } from "lucide-react";
import { getDashboardNavItems, isNavItemActive } from "@/lib/dashboardNav";

const iconByLabel = {
  "Admin Console": PieChart,
  Users: User,
  Providers: ChefHat,
  Categories: Settings,
  Orders: ShoppingBag,
  Meals: UtensilsIcon,
  Profile: User,
} as const;

function UtensilsIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  )
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const items = getDashboardNavItems(pathname);

  return (
    <div className="hidden border-r border-slate-100 bg-white md:block md:w-72 shadow-sm relative z-40" style={{ fontFamily: "var(--font-sora)" }}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-pink-500"></div>
      
      <div className="flex h-20 items-center justify-center border-b border-slate-100 px-6 font-semibold shrink-0 mb-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
             <ChefHat className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-extrabold text-slate-800 tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>FoodHub</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-auto py-4 px-4 custom-scrollbar">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-4">Menu Overview</div>
        <nav className="grid items-start gap-2 text-sm font-medium">
          {items.map((item) => {
            const Icon = iconByLabel[item.label as keyof typeof iconByLabel] || Home;
            const isActive = isNavItemActive(pathname, item.href);
            
            return (
               <Link
               key={item.href}
               href={item.href}
               className={cn(
                 "flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-500 transition-all font-bold hover:bg-slate-50 hover:text-slate-700",
                 isActive ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:text-white" : ""
               )}
             >
               <Icon className={cn("h-5 w-5", isActive ? "text-indigo-100" : "text-slate-400")} />
               {item.label}
             </Link>
            )
          })}
        </nav>
      </div>
      
      {/* Background decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none opacity-50"></div>
    </div>
  );
}
