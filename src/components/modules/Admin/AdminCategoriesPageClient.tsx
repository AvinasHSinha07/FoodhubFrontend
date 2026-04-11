"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CategoryServices, ICreateCategoryPayload } from "@/services/category.services";
import { ICategory } from "@/types/category.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { queryKeys } from "@/lib/query/query-keys";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
});

export default function AdminCategoriesPageClient() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.categories(),
    queryFn: () => CategoryServices.getCategories(),
    staleTime: 1000 * 60 * 60,
  });

  const categories = (data?.data || []) as ICategory[];

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "" },
  });

  const { mutateAsync: createCategory, isPending: isCreating } = useMutation({
    mutationFn: (payload: ICreateCategoryPayload) => CategoryServices.createCategory(payload),
  });

  const { mutateAsync: deleteCategory, isPending: isDeletingAny } = useMutation({
    mutationFn: (id: string) => CategoryServices.deleteCategory(id),
  });

  const onSubmit = async (values: z.infer<typeof categorySchema>) => {
    const payload: ICreateCategoryPayload = { name: values.name };

    try {
      await createCategory(payload);
      toast.success("Category created successfully!");
      form.reset();
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
    } catch {
      toast.error("Failed to create category");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      toast.success("Category deleted");
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
    } catch {
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Categories</h1>
          <p className="text-gray-500">Add, edit, or remove meal categories.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-4 w-4" /> New Category
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="E.g., Fast Food, Deshi..." {...field} disabled={isCreating} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isCreating} className="w-full">
                    {isCreating ? "Creating..." : "Save Category"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : categories.length === 0 ? (
            <Card className="text-center py-20 bg-gray-50">
              <Copy className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <h2 className="text-xl font-semibold text-gray-700">No categories found</h2>
              <p className="text-gray-500 mt-2">Use the form on the left to add one.</p>
            </Card>
          ) : (
            <div className="bg-white rounded-md border shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b text-gray-600 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{cat.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="font-mono text-xs text-gray-400 font-normal">
                          {cat.id.slice(0, 8)}...
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(cat.id)}
                          disabled={isDeletingAny}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
