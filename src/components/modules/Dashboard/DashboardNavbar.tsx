"use client";

import { UserCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardNavbar() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 shrink-0 shadow-sm md:px-6">
      <div className="ml-auto flex items-center gap-4">
        <button className="flex items-center gap-2 p-2 rounded-full hover:bg-muted transition-colors focus:bg-muted">
          <UserCircle className="h-6 w-6 text-foreground" />
          <span className="sr-only">Toggle user menu</span>
        </button>
      </div>
    </header>
  );
}
