"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { MealServices } from "@/services/meal.services";
import { ProviderProfileServices } from "@/services/providerProfile.services";
import { IMeal } from "@/types/meal.types";
import { IProviderProfile } from "@/types/user.types";

export default function ProviderMealsPage() {
  const [meals, setMeals] = useState<IMeal[]>([]);
  const [profile, setProfile] = useState<IProviderProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First get profile to know our provider ID
        const profileRes = await ProviderProfileServices.getMyProfile();
        setProfile(profileRes.data);

        // Fetch our meals
        if (profileRes.data?.id) {
          const mealsRes = await MealServices.getAllMeals({
            providerId: profileRes.data.id,
          });
          setMeals(mealsRes.data || []);
        }
      } catch (error: any) {
        if (error.response?.status !== 404) {
          toast.error("Failed to load meals data");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this meal?")) return;
    
    try {
      await MealServices.deleteMeal(id);
      setMeals(meals.filter((m) => m.id !== id));
      toast.success("Meal deleted successfully");
    } catch (error) {
      toast.error("Failed to delete meal");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-semibold mb-2">Profile Required</h2>
        <p className="text-gray-500 mb-4">You must create your restaurant profile before adding meals.</p>
        <Button asChild>
          <Link href="/provider/profile">Create Profile</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Meals</h1>
        <Button asChild>
          <Link href="/provider/meals/create">
            <Plus className="mr-2 h-4 w-4" /> Add Meal
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Menu Items</CardTitle>
        </CardHeader>
        <CardContent>
          {meals.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No meals found. Start by adding a new meal.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meals.map((meal) => (
                  <TableRow key={meal.id}>
                    <TableCell className="font-medium">{meal.title}</TableCell>
                    <TableCell>{meal.category?.name || "Uncategorized"}</TableCell>
                    <TableCell>${meal.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${meal.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {meal.isAvailable ? "Available" : "Hidden"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/provider/meals/edit/${meal.id}`}>
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(meal.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
