"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { UploadServices } from "@/services/upload.services";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea"

import { createMealSchema } from "@/zod/meal.validation";
import { MealServices } from "@/services/meal.services";
import { CategoryServices } from "@/services/category.services";
import { IMeal } from "@/types/meal.types";
import { ICategory } from "@/types/category.types";
import { Checkbox } from "@/components/ui/checkbox";

type FormData = z.infer<typeof createMealSchema>;

export default function MealForm({
  initialData,
}: {
  initialData?: IMeal | null;
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await CategoryServices.getCategories();
        if (response.data) {
          setCategories(response.data);
        }
      } catch (err) {
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(createMealSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      categoryId: initialData?.categoryId || "",
      dietaryTag: initialData?.dietaryTag || "",
      image: initialData?.image || "",
      isAvailable: initialData?.isAvailable ?? true,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      if (initialData?.id) {
        await MealServices.updateMeal(initialData.id, data);
        toast.success("Meal updated successfully");
      } else {
        await MealServices.createMeal(data);
        toast.success("Meal created successfully");
      }
      router.push("/provider/meals");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-foreground">Meal Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Spicy Chicken Burger" {...field} className="h-12 rounded-[14px] bg-background border-border/50 focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3] font-medium" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-foreground">Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the meal ingredients and flavors..."
                  {...field}
                  className="rounded-[14px] bg-background border-border/50 focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3] font-medium resize-none min-h-[120px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-foreground">Price ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                    className="h-12 rounded-[14px] bg-background border-border/50 focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3] font-medium"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-foreground">Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 rounded-[14px] bg-background border-border/50 font-medium focus:ring-[#377771] dark:focus:ring-[#4CE0B3]">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-[16px] border-border/50">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="font-medium">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dietaryTag"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-foreground">Dietary Tag (Optional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 rounded-[14px] bg-background border-border/50 font-medium focus:ring-[#377771] dark:focus:ring-[#4CE0B3]">
                      <SelectValue placeholder="Select dietary tag" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-[16px] border-border/50">
                    <SelectItem value="VEGAN" className="font-medium">Vegan</SelectItem>
                    <SelectItem value="VEGETARIAN" className="font-medium">Vegetarian</SelectItem>
                    <SelectItem value="HALAL" className="font-medium">Halal</SelectItem>
                    <SelectItem value="Non-Veg" className="font-medium">Non-Veg</SelectItem>
                    <SelectItem value="GLUTEN_FREE" className="font-medium">Gluten Free</SelectItem>
                    <SelectItem value="NONE" className="font-medium">None</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-foreground">Meal Image</FormLabel>
                <FormControl>
                  <div className="flex gap-4 items-center">
                    <Input 
                      type="file" 
                      accept="image/*"
                      disabled={isUploadingImage}
                      className="h-12 rounded-[14px] bg-muted/50 border-border/50 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-[10px] file:border-0 file:text-sm file:font-bold file:bg-[#377771]/10 file:text-[#377771] dark:file:bg-[#4CE0B3]/10 dark:file:text-[#4CE0B3] cursor-pointer"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploadingImage(true);
                        try {
                          const res = await UploadServices.uploadImage(file);
                          field.onChange(res.data?.url || "");
                        } catch (err) {
                          toast.error("Failed to upload image");
                        } finally {
                          setIsUploadingImage(false);
                        }
                      }} 
                    />
                    {field.value && (
                      <img src={field.value} alt="Preview" className="h-12 w-12 object-cover rounded-[10px] shadow-sm border border-border/50 shrink-0" />
                    )}
                  </div>
                </FormControl>
                <FormDescription className="text-xs text-slate-500 font-medium">
                  {isUploadingImage ? "Uploading..." : "Upload an appealing picture of your meal."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isAvailable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-[20px] border border-border/50 bg-muted/20 p-6">
              <div className="space-y-1">
                <FormLabel className="text-lg font-extrabold text-foreground">Availability</FormLabel>
                <FormDescription className="font-medium text-slate-500">
                  Make this meal visible and purchasable by customers.
                </FormDescription>
              </div>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="rounded-[6px] w-6 h-6 border-border/50 data-[state=checked]:bg-[#377771] data-[state=checked]:border-[#377771] dark:data-[state=checked]:bg-[#4CE0B3] dark:data-[state=checked]:border-[#4CE0B3]"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="pt-6 border-t border-border/50 flex justify-end">
          <Button type="submit" className="w-full sm:w-auto h-12 px-8 rounded-[14px] bg-[#ED6A5E] hover:bg-[#FF8E72] text-white font-bold shadow-md hover:-translate-y-0.5 transition-all" disabled={isLoading}>
            {isLoading ? "Saving Changes..." : initialData ? "Update Meal" : "Create Meal"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
