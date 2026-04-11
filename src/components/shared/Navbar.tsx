"use client";

import Link from "next/link";
import { Sora } from "next/font/google";
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
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/providers/CartProvider";

const sora = Sora({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

export default function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const { items } = useCart();
  const cartItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

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
    
    // Always visible to everyone
    let links = [
      { label: "Meals", href: "/meals" },
      { label: "Restaurants", href: "/restaurants" },
    ];

    if (role === "CUSTOMER") {
      links.push({ label: "My Orders", href: "/customer/orders" });
    } else if (role === "PROVIDER") {
      links.push({ label: "Provider Dashboard", href: "/provider/orders" });
    } else if (role === "ADMIN") {
      links.push({ label: "Admin Dashboard", href: "/admin/dashboard" });
    }

    return links;
  };

  const links = getLinks();

  return (
    <header className="sticky top-0 z-40 border-b border-orange-100/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group inline-flex items-center gap-3">      
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-white shadow-sm shadow-orange-200">
            <Truck className="h-5 w-5" />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            FoodHub
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-orange-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {!isPending && (
          <div className="hidden items-center gap-2 lg:flex">
            {(!session || (session?.user as any)?.role === "CUSTOMER") && (
              <Button variant="ghost" size="icon" asChild className="relative mr-2">
                <Link href="/checkout">
                  <ShoppingCart className="h-5 w-5 text-slate-700" />
                  {cartItemsCount > 0 && (
                    <span className="absolute top-1 right-1 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
              </Button>
            )}
            
            {session ? (
              <Button onClick={handleLogout} variant="outline" className="text-slate-700 border-slate-300 hover:bg-slate-100">
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-orange-600 text-white hover:bg-orange-700">
                  <Link href="/register">Create Account</Link>
                </Button>
              </>
            )}
          </div>
        )}

        <Sheet>
          <div className="flex items-center gap-2 lg:hidden">
            {(!session || (session?.user as any)?.role === "CUSTOMER") && (
              <Button variant="ghost" size="icon" asChild className="relative">
                <Link href="/checkout">
                  <ShoppingCart className="h-5 w-5 text-slate-700" />
                  {cartItemsCount > 0 && (
                    <span className="absolute top-1 right-1 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
              </Button>
            )}
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">        
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation</span>
              </Button>
            </SheetTrigger>
          </div>
          <SheetContent side="right" className="w-[320px]">
            <SheetHeader className="border-b">
              <SheetTitle className="text-lg font-bold">FoodHub Navigation</SheetTitle>
            </SheetHeader>
            <div className="grid gap-2 px-4 py-5">
              {links.map((item) => (
                <SheetClose key={item.href} asChild>
                  <Link
                    href={item.href}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                  >
                    {item.label}
                  </Link>
                </SheetClose>
              ))}
              <div className="mt-4 grid gap-2 border-t pt-4">
                {!isPending && session ? (
                  <SheetClose asChild>
                    <Button onClick={handleLogout} variant="outline" className="w-full text-slate-700 border-slate-300 hover:bg-slate-100">
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </Button>
                  </SheetClose>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Button variant="outline" asChild>
                        <Link href="/login">Sign In</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild className="bg-orange-600 text-white hover:bg-orange-700">
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
