"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Settings, User, ShoppingBag } from "lucide-react";

const mainNavItems = [
  { href: "/customer", label: "Dashboard", icon: Home },
  { href: "/customer/orders", label: "Orders", icon: ShoppingBag },
  { href: "/customer/profile", label: "Profile", icon: User },
  { href: "/customer/settings", label: "Settings", icon: Settings },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  // In a real application, navigation elements might differ relative to actual roles.
  let items = mainNavItems;
  if(pathname.startsWith("/provider")) {
    items = [
      { href: "/provider", label: "Dashboard", icon: Home },
      { href: "/provider/menu", label: "Menu", icon: ShoppingBag },
      { href: "/provider/profile", label: "Profile", icon: User },
    ];
  } else if (pathname.startsWith("/admin")) {
    items = [
      { href: "/admin", label: "Admin Console", icon: Home },
      { href: "/admin/users", label: "Users", icon: User },
    ];
  }

  return (
    <div className="hidden border-r bg-card md:block md:w-64">
      <div className="flex h-14 items-center border-b px-4 font-semibold shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <span>FoodHub Dashboard</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
               <Link
               key={item.href}
               href={item.href}
               className={cn(
                 "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
                 pathname === item.href ? "bg-muted text-primary font-semibold" : ""
               )}
             >
               <Icon className="h-4 w-4" />
               {item.label}
             </Link>
            )
          })}
        </nav>
      </div>
    </div>
  );
}
