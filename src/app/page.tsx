import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
        Welcome to FoodHub
      </h1>
      <p className="mt-4 text-lg text-gray-600 max-w-2xl">
        Discover the best meals around you, prepared by verified providers. Browse menus, order directly, and get your food delivered.
      </p>
      
      <div className="mt-10 flex gap-4">
        <Link href="/login">
          <Button size="lg" className="rounded-full px-8">Sign In</Button>   
        </Link>
        <Link href="/register">
          <Button size="lg" variant="outline" className="rounded-full px-8">Create Account</Button>
        </Link>
      </div>

      <div className="mt-20 flex gap-4">
        <Link href="/admin">
          <Button variant="secondary" size="sm">Admin Testing Panel</Button>   
        </Link>
        <Link href="/provider">
          <Button variant="secondary" size="sm">Provider Dashboard</Button>   
        </Link>
        <Link href="/customer">
          <Button variant="secondary" size="sm">Customer Orders</Button>   
        </Link>
      </div>
    </div>
  );
}
