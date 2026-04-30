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
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Manage Categories</h1>
          <p className="text-slate-500 font-medium mt-1">Add, edit, or remove meal categories.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-8">
        <div>
          <Card className="rounded-[24px] border-border/50 bg-background shadow-sm sticky top-24">
            <CardHeader className="bg-muted/30 border-b border-border/20 pb-6 pt-8 px-8">
              <CardTitle className="text-xl font-extrabold text-foreground flex items-center gap-2">
                <Plus className="h-5 w-5 text-[#377771] dark:text-[#4CE0B3]" /> New Category
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="E.g., Fast Food, Deshi..." {...field} disabled={isCreating} className="h-12 rounded-[14px] bg-background border-border/50 focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3] font-medium" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isCreating} className="w-full h-12 rounded-[14px] bg-[#377771] hover:bg-[#4CE0B3] text-white hover:text-emerald-950 font-bold transition-all shadow-md hover:-translate-y-0.5">
                    {isCreating ? "Creating..." : "Save Category"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-[400px] w-full rounded-[24px]" />
            </div>
          ) : categories.length === 0 ? (
            <Card className="text-center py-24 bg-background border-border/50 rounded-[24px] shadow-sm">
              <div className="mx-auto h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-6">
                <Copy className="h-8 w-8 text-slate-400" />
              </div>
              <h2 className="text-2xl font-extrabold text-foreground">No Categories Found</h2>
              <p className="text-slate-500 font-medium mt-2">Use the form to add one.</p>
            </Card>
          ) : (
            <div className="bg-background rounded-[24px] border border-border/50 shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/30 border-b border-border/50 text-slate-500 uppercase text-xs font-bold tracking-widest">
                  <tr>
                    <th className="px-8 py-5">Name</th>
                    <th className="px-8 py-5">System ID</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="font-bold text-foreground text-base group-hover:text-[#377771] dark:group-hover:text-[#4CE0B3] transition-colors">{cat.name}</div>
                      </td>
                      <td className="px-8 py-5">
                        <Badge variant="secondary" className="font-mono text-xs text-slate-400 bg-muted tracking-widest px-2 py-1">
                          {cat.id.slice(0, 8)}
                        </Badge>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-[10px] text-[#ED6A5E] hover:text-[#ED6A5E] hover:bg-[#ED6A5E]/10"
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
