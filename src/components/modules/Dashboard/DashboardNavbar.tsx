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
    <header className="flex h-20 items-center gap-4 border-b border-border/40 bg-background/60 backdrop-blur-xl px-8 shrink-0 shadow-sm sticky top-0 z-30 transition-all">
      <div className="flex items-center gap-4 w-full justify-between md:justify-end">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open dashboard menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 border-r-0 shadow-2xl w-[320px] rounded-r-[24px]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ED6A5E] to-[#FFAF87]"></div>
            <SheetHeader className="border-b border-border/40 p-6 flex justify-center pb-4">
              <SheetTitle className="text-xl font-extrabold text-[#377771] dark:text-white">FoodHub</SheetTitle>
            </SheetHeader>
            <nav className="p-4 grid gap-1 text-[14px] font-semibold relative">
              {navItems.map((item) => (
                <SheetClose key={item.href} asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "rounded-[16px] px-4 py-3.5 text-slate-500 dark:text-slate-400 hover:text-[#377771] dark:hover:text-[#4CE0B3] hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all",
                      isNavItemActive(pathname, item.href) ? "bg-[#377771] text-white shadow-md shadow-[#377771]/20 hover:bg-[#2c615c] hover:text-white" : ""
                    )}
                  >
                    {item.label}
                  </Link>
                </SheetClose>
              ))}
            </nav>
            <div className="absolute bottom-8 left-6 right-6">
               <Button onClick={handleLogout} variant="outline" className="w-full text-destructive border-destructive/20 hover:bg-destructive/10 rounded-xl h-11">
                 <LogOut className="mr-2 h-4 w-4" /> Logout
               </Button>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ED6A5E]">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#377771] to-[#4CE0B3] flex items-center justify-center shadow-md">
                   <UserCircle className="h-6 w-6 text-white" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl border-border/50 shadow-xl p-2 bg-background/95 backdrop-blur-md">
              <div className="px-2 py-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">My Account</div>
              <DropdownMenuItem asChild className="rounded-[12px] focus:bg-slate-50 dark:focus:bg-slate-800 focus:text-foreground cursor-pointer py-2.5">
                <Link href={profilePath} className="font-semibold text-slate-700 dark:text-slate-200">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-[12px] focus:bg-slate-50 dark:focus:bg-slate-800 focus:text-foreground cursor-pointer py-2.5">
                <Link href="/" className="font-semibold text-slate-700 dark:text-slate-200">Back to Website</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2 border-border/40" />
              <DropdownMenuItem onClick={handleLogout} className="rounded-[12px] focus:bg-destructive/10 text-destructive focus:text-destructive font-bold cursor-pointer py-2.5">
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
