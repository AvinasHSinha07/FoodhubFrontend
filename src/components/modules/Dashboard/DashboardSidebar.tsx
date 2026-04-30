"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Settings, User, ShoppingBag, PieChart, ChefHat, Heart, TicketPercent } from "lucide-react";
import { getDashboardNavItems, isNavItemActive } from "@/lib/dashboardNav";

const iconByLabel = {
  "Admin Console": PieChart,
  Analytics: PieChart,
  Users: User,
  Providers: ChefHat,
  Categories: Settings,
  Coupons: TicketPercent,
  Orders: ShoppingBag,
  Favorites: Heart,
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

import { motion } from "framer-motion";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const items = getDashboardNavItems(pathname);

  return (
    <div className="hidden md:flex md:w-72 p-4 shrink-0 h-screen sticky top-0 bg-[#0F172A]/5 dark:bg-black/20">
      <div className="flex flex-col w-full h-full bg-white/70 dark:bg-[#1E293B]/80 backdrop-blur-2xl rounded-[24px] border border-white/50 dark:border-white/10 shadow-[0_8px_32px_rgba(55,119,113,0.08)] overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ED6A5E] to-[#FFAF87]"></div>
        
        <div className="flex h-24 items-center border-b border-slate-200/50 dark:border-slate-700/50 px-8 shrink-0 mb-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#377771] to-[#4CE0B3] flex items-center justify-center shadow-lg shadow-[#377771]/20 group-hover:scale-105 transition-transform">
               <ChefHat className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-[#377771] dark:text-white tracking-tight">FoodHub</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-auto py-2 px-4 custom-scrollbar">
          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-4">Menu Overview</div>
          <nav className="grid items-start gap-1 relative">
            {items.map((item) => {
              const Icon = iconByLabel[item.label as keyof typeof iconByLabel] || Home;
              const isActive = isNavItemActive(pathname, item.href);
              
              return (
                 <Link
                 key={item.href}
                 href={item.href}
                 className={cn(
                   "relative flex items-center gap-3 rounded-[16px] px-4 py-3.5 text-[14px] transition-all font-semibold z-10",
                   isActive ? "text-white" : "text-slate-500 dark:text-slate-400 hover:text-[#377771] dark:hover:text-[#4CE0B3] hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                 )}
               >
                 {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-[#377771] rounded-[16px] shadow-md shadow-[#377771]/20 -z-10"
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                 )}
                 <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-white" : "text-slate-400")} />
                 {item.label}
               </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
