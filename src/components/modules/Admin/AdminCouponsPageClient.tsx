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
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Coupon Engine</h1>
        <p className="text-sm text-gray-500">Create and manage checkout discounts.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{formState.id ? "Edit Coupon" : "Create Coupon"}</CardTitle>
          <CardDescription>Configure discount type, limits, and activation status.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={saveCoupon}>
            <Input
              value={formState.code}
              onChange={(event) => setFormState((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))}
              placeholder="Coupon Code"
              required
            />
            <Input
              value={formState.description || ""}
              onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Description"
            />

            <Select
              value={formState.discountType}
              onValueChange={(value) =>
                setFormState((prev) => ({ ...prev, discountType: value as "PERCENTAGE" | "FIXED" }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                <SelectItem value="FIXED">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              value={formState.discountValue}
              onChange={(event) => setFormState((prev) => ({ ...prev, discountValue: Number(event.target.value) }))}
              placeholder="Discount Value"
              min={0.01}
              step="0.01"
              required
            />

            <Input
              type="number"
              value={formState.minOrderAmount ?? ""}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  minOrderAmount: event.target.value ? Number(event.target.value) : undefined,
                }))
              }
              placeholder="Minimum Order Amount"
              min={0}
              step="0.01"
            />
            <Input
              type="number"
              value={formState.maxDiscountAmount ?? ""}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  maxDiscountAmount: event.target.value ? Number(event.target.value) : undefined,
                }))
              }
              placeholder="Maximum Discount"
              min={0}
              step="0.01"
            />

            <Input
              type="number"
              value={formState.usageLimit ?? ""}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  usageLimit: event.target.value ? Number(event.target.value) : undefined,
                }))
              }
              placeholder="Total Usage Limit"
              min={1}
            />
            <Input
              type="number"
              value={formState.perUserLimit ?? 1}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, perUserLimit: Number(event.target.value) || 1 }))
              }
              placeholder="Per User Limit"
              min={1}
            />

            <label className="md:col-span-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formState.isActive ?? true}
                onChange={(event) => setFormState((prev) => ({ ...prev, isActive: event.target.checked }))}
              />
              Coupon is active
            </label>

            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" disabled={isCreating || isUpdating}>
                {formState.id ? "Update Coupon" : "Create Coupon"}
              </Button>
              {formState.id ? (
                <Button type="button" variant="outline" onClick={() => setFormState(initialForm)}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Coupons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : coupons.length === 0 ? (
            <p className="text-sm text-gray-500">No coupons created yet.</p>
          ) : (
            coupons.map((coupon) => (
              <div key={coupon.id} className="rounded-md border p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{coupon.code}</p>
                    <p className="text-sm text-gray-500">
                      {coupon.discountType === "PERCENTAGE"
                        ? `${coupon.discountValue}% off`
                        : `$${coupon.discountValue.toFixed(2)} off`}
                      {coupon.minOrderAmount ? ` • Min $${coupon.minOrderAmount.toFixed(2)}` : ""}
                    </p>
                    <p className="text-xs text-gray-500">
                      Used: {coupon.usedCount}
                      {coupon.usageLimit ? `/${coupon.usageLimit}` : ""} • Per user: {coupon.perUserLimit}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => toggleStatus(coupon)}>
                      {coupon.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      size="sm"
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
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600"
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
