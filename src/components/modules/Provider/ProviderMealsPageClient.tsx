"use client";

import Link from "next/link";import Image from "next/image";import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MealServices } from "@/services/meal.services";
import { ProviderProfileServices } from "@/services/providerProfile.services";
import { IMeal } from "@/types/meal.types";
import { IProviderProfile } from "@/types/user.types";
import { queryKeys } from "@/lib/query/query-keys";

const getProviderProfileSafely = async () => {
  try {
    return await ProviderProfileServices.getMyProfile();
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }

    throw error;
  }
};

export default function ProviderMealsPageClient() {
  const queryClient = useQueryClient();

  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: queryKeys.myProviderProfile(),
    queryFn: () => getProviderProfileSafely(),
    staleTime: 1000 * 60 * 5,
  });

  const profile = (profileData?.data || null) as IProviderProfile | null;

  const { data: mealsData, isLoading: isMealsLoading } = useQuery({
    queryKey: queryKeys.providerMeals(profile?.id || ""),
    queryFn: () => MealServices.getAllMeals({ providerId: profile?.id }),
    enabled: Boolean(profile?.id),
    staleTime: 1000 * 60 * 3,
  });

  const meals = (mealsData?.data || []) as IMeal[];
  const isLoading = isProfileLoading || isMealsLoading;

  const { mutateAsync: deleteMeal } = useMutation({
    mutationFn: (mealId: string) => MealServices.deleteMeal(mealId),
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this meal?")) return;

    try {
      await deleteMeal(id);
      await queryClient.invalidateQueries({ queryKey: queryKeys.providerMeals(profile?.id || "") });
      toast.success("Meal deleted successfully");
    } catch {
      toast.error("Failed to delete meal");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-[600px] w-full rounded-[24px]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] max-w-lg mx-auto text-center space-y-4">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
          <Edit className="w-10 h-10 text-slate-300" />
        </div>
        <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Profile Required</h2>
        <p className="text-slate-500 font-medium">You must create your restaurant profile before adding meals to your menu.</p>
        <Button asChild className="h-12 px-8 rounded-[14px] bg-[#377771] hover:bg-[#4CE0B3] text-white hover:text-emerald-950 font-bold shadow-md hover:-translate-y-0.5 transition-all mt-4">
          <Link href="/provider/profile">Create Profile</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Menu Items</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your restaurant's meals, pricing, and availability.</p>
        </div>
        <Button asChild className="h-12 px-6 rounded-[14px] bg-[#ED6A5E] hover:bg-[#FF8E72] text-white font-bold shadow-md hover:-translate-y-0.5 transition-all w-max shrink-0">
          <Link href="/provider/meals/create">
            <Plus className="mr-2 h-5 w-5" /> Add New Meal
          </Link>
        </Button>
      </div>

      <Card className="rounded-[24px] border-border/50 shadow-sm bg-background overflow-hidden">
        <CardContent className="p-0">
          {meals.length === 0 ? (
            <div className="text-center py-24 px-6 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                <Plus className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-2xl font-extrabold text-foreground mb-2">No Meals Found</h3>
              <p className="text-slate-500 font-medium mb-6">Your menu is currently empty. Start by adding your first meal.</p>
              <Button asChild className="h-11 px-6 rounded-[12px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-[#377771] dark:hover:bg-[#4CE0B3] dark:hover:text-emerald-950 transition-all">
                <Link href="/provider/meals/create">
                  Add a Meal
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-b border-border/50">
                  <TableHead className="font-bold text-foreground py-4 px-6">Title</TableHead>
                  <TableHead className="font-bold text-foreground py-4">Category</TableHead>
                  <TableHead className="font-bold text-foreground py-4">Price</TableHead>
                  <TableHead className="font-bold text-foreground py-4">Status</TableHead>
                  <TableHead className="text-right font-bold text-foreground py-4 px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meals.map((meal) => (
                  <TableRow key={meal.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors group">
                    <TableCell className="font-bold text-foreground px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[8px] bg-muted overflow-hidden shrink-0">
                          {meal.image ? (
                            <Image src={meal.image} alt={meal.title} width={40} height={40} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#377771]/10 text-[#377771] dark:bg-[#4CE0B3]/10 dark:text-[#4CE0B3] font-bold text-xs">No Img</div>
                          )}
                        </div>
                        <span className="line-clamp-1">{meal.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 font-medium py-4">
                      <span className="px-3 py-1 bg-muted rounded-[8px] text-xs font-bold text-foreground">{meal.category?.name || "Uncategorized"}</span>
                    </TableCell>
                    <TableCell className="font-extrabold text-[#377771] dark:text-[#4CE0B3] py-4">${meal.price.toFixed(2)}</TableCell>
                    <TableCell className="py-4">
                      <span className={`px-3 py-1 rounded-[8px] text-[11px] font-bold uppercase tracking-wider ${meal.isAvailable ? "bg-[#377771]/10 text-[#377771] dark:bg-[#4CE0B3]/10 dark:text-[#4CE0B3]" : "bg-destructive/10 text-destructive"}`}>
                        {meal.isAvailable ? "Available" : "Hidden"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-[8px] hover:bg-muted text-foreground">
                          <Link href={`/provider/meals/edit/${meal.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(meal.id)} className="h-9 w-9 rounded-[8px] hover:bg-destructive/10 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
