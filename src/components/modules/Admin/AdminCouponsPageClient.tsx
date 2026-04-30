"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminServices, ICouponPayload } from "@/services/admin.services";
import { queryKeys } from "@/lib/query/query-keys";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type CouponFormState = ICouponPayload & { id?: string };

const initialForm: CouponFormState = {
  code: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: 10,
  minOrderAmount: undefined,
  maxDiscountAmount: undefined,
  usageLimit: undefined,
  perUserLimit: 1,
  isActive: true,
};

export default function AdminCouponsPageClient() {
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState<CouponFormState>(initialForm);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.adminCoupons(""),
    queryFn: () => AdminServices.getCoupons({ page: 1, limit: 30, sortBy: "createdAt", sortOrder: "desc" }),
    staleTime: 1000 * 60,
  });

  const coupons = data?.data || [];

  const { mutateAsync: createCoupon, isPending: isCreating } = useMutation({
    mutationFn: AdminServices.createCoupon,
  });

  const { mutateAsync: updateCoupon, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ICouponPayload> }) =>
      AdminServices.updateCoupon(id, payload),
  });

  const { mutateAsync: deleteCoupon, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => AdminServices.deleteCoupon(id),
  });

  const saveCoupon = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload: ICouponPayload = {
      code: formState.code,
      description: formState.description,
      discountType: formState.discountType,
      discountValue: Number(formState.discountValue),
      minOrderAmount: formState.minOrderAmount ? Number(formState.minOrderAmount) : undefined,
      maxDiscountAmount: formState.maxDiscountAmount ? Number(formState.maxDiscountAmount) : undefined,
      usageLimit: formState.usageLimit ? Number(formState.usageLimit) : undefined,
      perUserLimit: formState.perUserLimit ? Number(formState.perUserLimit) : 1,
      isActive: formState.isActive,
    };

    try {
      if (formState.id) {
        await updateCoupon({ id: formState.id, payload });
        toast.success("Coupon updated successfully.");
      } else {
        await createCoupon(payload);
        toast.success("Coupon created successfully.");
      }

      setFormState(initialForm);
      await queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save coupon.");
    }
  };

  const toggleStatus = async (coupon: any) => {
    try {
      await updateCoupon({
        id: coupon.id,
        payload: {
          isActive: !coupon.isActive,
        },
      });
      toast.success("Coupon status updated.");
      await queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update coupon status.");
    }
  };

  const removeCoupon = async (couponId: string) => {
    try {
      await deleteCoupon(couponId);
      toast.success("Coupon deleted.");
      await queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete coupon.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Coupon Engine</h1>
        <p className="text-slate-500 font-medium mt-1">Create and manage checkout discounts.</p>
      </div>

      <Card className="rounded-[24px] border-border/50 bg-background shadow-sm">
        <CardHeader className="bg-muted/30 border-b border-border/20 pb-6 pt-8 px-8">
          <CardTitle className="text-xl font-extrabold text-foreground">{formState.id ? "Edit Coupon" : "Create Coupon"}</CardTitle>
          <CardDescription className="text-slate-500 font-medium text-base mt-1">Configure discount type, limits, and activation status.</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form className="grid grid-cols-1 gap-6 md:grid-cols-2" onSubmit={saveCoupon}>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-foreground">Coupon Code</label>
              <Input
                value={formState.code}
                onChange={(event) => setFormState((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))}
                placeholder="e.g. SUMMER24"
                className="h-12 rounded-[14px] bg-background border-border/50 focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3] font-medium"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-foreground">Description</label>
              <Input
                value={formState.description || ""}
                onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Brief description"
                className="h-12 rounded-[14px] bg-background border-border/50 focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3] font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-foreground">Discount Type</label>
              <Select
                value={formState.discountType}
                onValueChange={(value) =>
                  setFormState((prev) => ({ ...prev, discountType: value as "PERCENTAGE" | "FIXED" }))
                }
              >
                <SelectTrigger className="h-12 rounded-[14px] bg-background border-border/50 font-medium focus:ring-[#377771] dark:focus:ring-[#4CE0B3]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-[16px] border-border/50">
                  <SelectItem value="PERCENTAGE" className="font-medium">Percentage</SelectItem>
                  <SelectItem value="FIXED" className="font-medium">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-foreground">Discount Value</label>
              <Input
                type="number"
                value={formState.discountValue}
                onChange={(event) => setFormState((prev) => ({ ...prev, discountValue: Number(event.target.value) }))}
                placeholder="e.g. 10"
                min={0.01}
                step="0.01"
                className="h-12 rounded-[14px] bg-background border-border/50 focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3] font-medium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-foreground">Min Order Amount ($)</label>
              <Input
                type="number"
                value={formState.minOrderAmount ?? ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    minOrderAmount: event.target.value ? Number(event.target.value) : undefined,
                  }))
                }
                placeholder="Optional"
                min={0}
                step="0.01"
                className="h-12 rounded-[14px] bg-background border-border/50 focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3] font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-foreground">Max Discount Amount ($)</label>
              <Input
                type="number"
                value={formState.maxDiscountAmount ?? ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    maxDiscountAmount: event.target.value ? Number(event.target.value) : undefined,
                  }))
                }
                placeholder="Optional"
                min={0}
                step="0.01"
                className="h-12 rounded-[14px] bg-background border-border/50 focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3] font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-foreground">Total Usage Limit</label>
              <Input
                type="number"
                value={formState.usageLimit ?? ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    usageLimit: event.target.value ? Number(event.target.value) : undefined,
                  }))
                }
                placeholder="Optional"
                min={1}
                className="h-12 rounded-[14px] bg-background border-border/50 focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3] font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-foreground">Per User Limit</label>
              <Input
                type="number"
                value={formState.perUserLimit ?? 1}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, perUserLimit: Number(event.target.value) || 1 }))
                }
                placeholder="Default is 1"
                min={1}
                className="h-12 rounded-[14px] bg-background border-border/50 focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3] font-medium"
              />
            </div>

            <label className="md:col-span-2 flex items-center gap-3 text-sm font-bold text-foreground p-4 bg-muted/20 rounded-[14px] border border-border/50 cursor-pointer w-max mt-2">
              <input
                type="checkbox"
                checked={formState.isActive ?? true}
                onChange={(event) => setFormState((prev) => ({ ...prev, isActive: event.target.checked }))}
                className="rounded-[6px] w-5 h-5 border-border/50 text-[#377771] dark:text-[#4CE0B3] focus:ring-[#377771]"
              />
              Coupon is actively accepting redemptions
            </label>

            <div className="md:col-span-2 flex gap-4 mt-4 pt-6 border-t border-border/50">
              <Button type="submit" disabled={isCreating || isUpdating} className="h-12 px-8 rounded-[14px] bg-[#377771] hover:bg-[#4CE0B3] text-white hover:text-emerald-950 font-bold transition-all shadow-md hover:-translate-y-0.5">
                {formState.id ? "Update Coupon" : "Create Coupon"}
              </Button>
              {formState.id ? (
                <Button type="button" variant="outline" onClick={() => setFormState(initialForm)} className="h-12 px-6 rounded-[14px] border-border/50 font-bold hover:bg-muted text-foreground">
                  Cancel Edit
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-[24px] border-border/50 bg-background shadow-sm">
        <CardHeader className="bg-muted/30 border-b border-border/20 pb-6 pt-8 px-8">
          <CardTitle className="text-xl font-extrabold text-foreground">Existing Coupons</CardTitle>
          <CardDescription className="text-slate-500 font-medium text-base mt-1">Review and manage active promotions.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-4">
          {isLoading ? (
            <>
              <Skeleton className="h-24 w-full rounded-[16px]" />
              <Skeleton className="h-24 w-full rounded-[16px]" />
            </>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 font-medium">No coupons created yet.</p>
            </div>
          ) : (
            coupons.map((coupon) => (
              <div key={coupon.id} className="rounded-[16px] border border-border/50 p-5 bg-background hover:bg-muted/30 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-extrabold tracking-wide text-foreground">{coupon.code}</p>
                      <span className={`px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase tracking-wider ${coupon.isActive ? "bg-[#377771]/10 text-[#377771] dark:bg-[#4CE0B3]/10 dark:text-[#4CE0B3]" : "bg-destructive/10 text-destructive"}`}>
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="font-bold text-[#377771] dark:text-[#4CE0B3] mt-1">
                      {coupon.discountType === "PERCENTAGE"
                        ? `${coupon.discountValue}% off`
                        : `$${coupon.discountValue.toFixed(2)} off`}
                      {coupon.minOrderAmount ? <span className="text-slate-400"> • Min ${coupon.minOrderAmount.toFixed(2)}</span> : ""}
                    </p>
                    <p className="text-xs font-medium text-slate-500 mt-1.5">
                      Used: <span className="text-foreground">{coupon.usedCount}</span>
                      {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""} • Per user: <span className="text-foreground">{coupon.perUserLimit}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => toggleStatus(coupon)}
                      className="h-10 px-4 rounded-[10px] border-border/50 font-bold hover:bg-muted text-foreground"
                    >
                      {coupon.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setFormState({
                          id: coupon.id,
                          code: coupon.code,
                          description: coupon.description || undefined,
                          discountType: coupon.discountType,
                          discountValue: coupon.discountValue,
                          minOrderAmount: coupon.minOrderAmount || undefined,
                          maxDiscountAmount: coupon.maxDiscountAmount || undefined,
                          usageLimit: coupon.usageLimit || undefined,
                          perUserLimit: coupon.perUserLimit,
                          isActive: coupon.isActive,
                        })
                      }
                      className="h-10 px-4 rounded-[10px] border-border/50 font-bold hover:bg-muted text-foreground"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-10 px-4 rounded-[10px] font-bold text-[#ED6A5E] hover:bg-[#ED6A5E]/10 hover:text-[#ED6A5E]"
                      onClick={() => removeCoupon(coupon.id)}
                      disabled={isDeleting}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
