"use client";

import { AuthServices } from "@/services/auth.services";
import { getDashboardNavItems, isNavItemActive } from "@/lib/dashboardNav";
import { toast } from "sonner";
import { Menu, LogOut, UserCircle } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const getProfilePath = (pathname: string) => {
  if (pathname.startsWith("/provider")) {
    return "/provider/profile";
  }

  if (pathname.startsWith("/admin")) {
    return "/admin";
  }

  return "/customer/profile";
};

export default function DashboardNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = getDashboardNavItems(pathname);
  const profilePath = getProfilePath(pathname);

  const handleLogout = async () => {
    try {
      await AuthServices.logoutUser();
      toast.success("Logged out successfully.");
      router.push("/login");
      router.refresh();
    } catch (error) {
      toast.error("Failed to logout. Please try again.");
    }
  };

  return (
    <header className="flex h-16 items-center gap-4 border-b border-slate-100 bg-white/80 backdrop-blur-md px-6 shrink-0 shadow-sm sticky top-0 z-30" style={{ fontFamily: "var(--font-sora)" }}>
      <div className="flex items-center gap-4 w-full justify-between md:justify-end">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden hover:bg-indigo-50 text-slate-700">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open dashboard menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 border-r-0 shadow-2xl w-72" style={{ fontFamily: "var(--font-sora)" }}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-pink-500"></div>
            <SheetHeader className="border-b border-slate-100 p-6 flex justify-center pb-4">
              <SheetTitle className="text-xl font-extrabold text-slate-800" style={{ fontFamily: "var(--font-space-grotesk)" }}>FoodHub</SheetTitle>
            </SheetHeader>
            <nav className="p-4 grid gap-2 text-sm font-medium">
              {navItems.map((item) => (
                <SheetClose key={item.href} asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "rounded-xl px-4 py-3 text-slate-500 hover:bg-indigo-50 hover:text-indigo-700 transition-all font-bold",
                      isNavItemActive(pathname, item.href) ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700 hover:text-white" : ""
                    )}
                  >
                    {item.label}
                  </Link>
                </SheetClose>
              ))}
            </nav>
            <div className="absolute bottom-8 left-4 right-4">
               <Button onClick={handleLogout} variant="outline" className="w-full text-pink-600 border-pink-200 hover:bg-pink-50 rounded-xl font-bold">
                 <LogOut className="mr-2 h-4 w-4" /> Logout
               </Button>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-2 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-sm">
                   <UserCircle className="h-6 w-6 text-white" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl border-slate-100 shadow-xl p-2" style={{ fontFamily: "var(--font-sora)" }}>
              <div className="px-2 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">My Account</div>
              <DropdownMenuItem asChild className="rounded-xl focus:bg-indigo-50 focus:text-indigo-700 cursor-pointer py-2">
                <Link href={profilePath} className="font-semibold text-slate-700">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl focus:bg-indigo-50 focus:text-indigo-700 cursor-pointer py-2">
                <Link href="/" className="font-semibold text-slate-700">Back to Website</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2 border-slate-100" />
              <DropdownMenuItem onClick={handleLogout} className="rounded-xl focus:bg-pink-50 text-pink-600 focus:text-pink-700 font-bold cursor-pointer py-2">
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
