"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Truck, ShoppingCart } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { authClient } from "@/lib/authClient";
import { AuthServices } from "@/services/auth.services";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/providers/CartProvider";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { items, providerId } = useCart();
  const cartItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const cartHref = providerId ? `/restaurant/${providerId}` : cartItemsCount > 0 ? "/checkout" : "/restaurants";

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await AuthServices.logoutUser();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  const getLinks = () => {
    const role = (session?.user as any)?.role;
    
    let links = [
      { label: "Meals", href: "/meals" },
      { label: "Restaurants", href: "/restaurants" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Help", href: "/help" },
    ];

    if (role === "CUSTOMER") {
      links.push({ label: "My Orders", href: "/customer/orders" });
      links.push({ label: "Favorites", href: "/customer/favorites" });
    } else if (role === "PROVIDER") {
      links.push({ label: "Provider Dashboard", href: "/provider/orders" });
    } else if (role === "ADMIN") {
      links.push({ label: "Admin Dashboard", href: "/admin" });
    }

    return links;
  };

  const links = getLinks();

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300 pt-4 px-4 mb-4 sm:px-6 lg:px-8">
      <div 
        className={`mx-auto flex h-16 max-w-7xl items-center justify-between rounded-2xl px-4 sm:px-6 transition-all duration-500 border
          ${scrolled 
            ? "bg-white/80 backdrop-blur-2xl border-white/50 shadow-[0_8px_32px_rgba(55,119,113,0.12)]" 
            : "bg-white/40 backdrop-blur-md border-white/20 shadow-sm"
          }`}
      >
        <Link href="/" className="group inline-flex items-center gap-3">      
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#ED6A5E] text-white shadow-lg shadow-[#ED6A5E]/20 transition-transform group-hover:scale-105">
            <Truck className="h-5 w-5" />
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-[#377771]">
            FoodHub
          </span>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {links.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-4 py-2 text-sm font-semibold transition-colors"
              >
                <span className={`relative z-10 ${isActive ? "text-[#ED6A5E]" : "text-[#377771] hover:text-[#ED6A5E]"}`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-x-4 -bottom-[1px] h-[2px] rounded-full bg-[#ED6A5E]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {!isPending && (
          <div className="hidden items-center gap-3 lg:flex">
            {(!session || (session?.user as any)?.role === "CUSTOMER") && (
              <Button variant="ghost" size="icon" asChild className="relative mr-2 rounded-xl hover:bg-[#FFAF87]/10 text-[#377771]">
                <Link href={cartHref}>
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ED6A5E] text-[10px] font-bold text-white shadow-sm shadow-[#ED6A5E]/40 border-2 border-white"
                    >
                      {cartItemsCount}
                    </motion.span>
                  )}
                </Link>
              </Button>
            )}
            
            {session ? (
              <Button onClick={handleLogout} variant="outline" className="text-[#377771] border-[#377771]/20 hover:bg-[#377771]/5 rounded-xl font-medium">
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-[#377771] hover:bg-[#FFAF87]/10 hover:text-[#ED6A5E] rounded-xl font-medium">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-[#ED6A5E] text-white hover:bg-[#FF8E72] rounded-xl font-medium shadow-lg shadow-[#ED6A5E]/20 transition-all hover:-translate-y-0.5">
                  <Link href="/register">Create Account</Link>
                </Button>
              </>
            )}
          </div>
        )}

        <Sheet>
          <div className="flex items-center gap-2 lg:hidden">
            {(!session || (session?.user as any)?.role === "CUSTOMER") && (
              <Button variant="ghost" size="icon" asChild className="relative text-[#377771]">
                <Link href={cartHref}>
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ED6A5E] text-[10px] font-bold text-white shadow-sm border-2 border-white">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
              </Button>
            )}
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-[#377771]">        
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation</span>
              </Button>
            </SheetTrigger>
          </div>
          <SheetContent side="right" aria-describedby={undefined} className="w-[320px] rounded-l-3xl border-l-0 shadow-2xl">
            <SheetHeader className="border-b border-slate-100 pb-4">
              <SheetTitle className="text-xl font-extrabold tracking-tight text-[#377771]">FoodHub</SheetTitle>
            </SheetHeader>
            <div className="grid gap-2 py-6">
              {links.map((item) => (
                <SheetClose key={item.href} asChild>
                  <Link
                    href={item.href}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-[#377771] hover:bg-[#FFAF87]/10 hover:text-[#ED6A5E] transition-colors"
                  >
                    {item.label}
                  </Link>
                </SheetClose>
              ))}
              <div className="mt-6 grid gap-3 border-t border-slate-100 pt-6">
                {!isPending && session ? (
                  <SheetClose asChild>
                    <Button onClick={handleLogout} variant="outline" className="w-full text-[#377771] border-[#377771]/20 hover:bg-[#377771]/5 rounded-xl h-11">
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </Button>
                  </SheetClose>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Button variant="outline" asChild className="w-full text-[#377771] border-[#377771]/20 hover:bg-[#377771]/5 rounded-xl h-11">
                        <Link href="/login">Sign In</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild className="w-full bg-[#ED6A5E] text-white hover:bg-[#FF8E72] rounded-xl h-11 shadow-lg shadow-[#ED6A5E]/20">
                        <Link href="/register">Create Account</Link>
                      </Button>
                    </SheetClose>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
