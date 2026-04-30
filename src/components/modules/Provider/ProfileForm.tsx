"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateProviderProfileFormData,
  createProviderProfileSchema,
} from "@/zod/providerProfile.validation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ProviderProfileServices } from "@/services/providerProfile.services";
import { UploadServices } from "@/services/upload.services";
import { IProviderProfile } from "@/types/user.types";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DEFAULT_WINDOWS = DAY_LABELS.map((_, dayOfWeek) => ({
  dayOfWeek,
  openTime: "09:00",
  closeTime: "22:00",
  isClosed: false,
}));

export default function ProfileForm({
  initialData,
}: {
  initialData?: IProviderProfile | null;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const form = useForm<CreateProviderProfileFormData>({
    resolver: zodResolver(createProviderProfileSchema),
    defaultValues: {
      restaurantName: initialData?.restaurantName || "",
      description: initialData?.description || "",
      address: initialData?.address || "",
      cuisineType: initialData?.cuisineType || "",
      preparationTimeMinutes: initialData?.preparationTimeMinutes || 30,
      timezone: initialData?.timezone || "UTC",
      logo: initialData?.logo || "",
      bannerImage: initialData?.bannerImage || "",
      availabilityWindows:
        initialData?.availabilityWindows && initialData.availabilityWindows.length > 0
          ? initialData.availabilityWindows
          : DEFAULT_WINDOWS,
    },
  });

  const availabilityWindows = form.watch("availabilityWindows") || DEFAULT_WINDOWS;

  const onSubmit = async (data: CreateProviderProfileFormData) => {
    setIsSubmitting(true);
    try {
      if (initialData) {
        await ProviderProfileServices.updateMyProfile(data);
        toast.success("Profile updated successfully");
      } else {
        await ProviderProfileServices.createMyProfile(data);
        toast.success("Profile created successfully");
        // Should probably reload or redirect if successful
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="restaurantName"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="font-bold text-foreground">Restaurant Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter restaurant name" {...field} className="h-12 rounded-[14px] bg-background border-border/50 focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3] font-medium" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="font-bold text-foreground">Physical Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter physical address" {...field} className="h-12 rounded-[14px] bg-background border-border/50 focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3] font-medium" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="font-bold text-foreground">Description (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="A short description of your restaurant" {...field} className="h-12 rounded-[14px] bg-background border-border/50 focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3] font-medium" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cuisineType"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="font-bold text-foreground">Cuisine Type (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Italian, Thai, Chinese" {...field} className="h-12 rounded-[14px] bg-background border-border/50 focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3] font-medium" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preparationTimeMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-foreground">Preparation Time (Minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={5}
                    max={180}
                    value={field.value}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    className="h-12 rounded-[14px] bg-background border-border/50 focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3] font-medium"
                  />
                </FormControl>
                <p className="text-xs text-slate-500 font-medium">Used for ETA on customer-facing pages.</p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-foreground">Timezone</FormLabel>
                <FormControl>
                  <Input placeholder="UTC" {...field} className="h-12 rounded-[14px] bg-background border-border/50 focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3] font-medium" />
                </FormControl>
                <p className="text-xs text-slate-500 font-medium">Example: UTC, Asia/Dhaka, America/New_York</p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 rounded-[20px] border border-border/50 p-6 bg-muted/20">
          <h3 className="text-lg font-extrabold text-foreground border-b border-border/50 pb-4">Weekly Availability</h3>
          <div className="space-y-4 mt-4">
            {DAY_LABELS.map((dayLabel, index) => {
              const row = availabilityWindows[index] || DEFAULT_WINDOWS[index];
              return (
                <div key={dayLabel} className="grid grid-cols-1 items-center gap-4 rounded-[16px] border border-border/50 bg-background p-4 md:grid-cols-[120px_1fr_1fr_auto] hover:border-border transition-colors">
                  <p className="text-sm font-extrabold text-foreground">{dayLabel}</p>
                  <Input
                    type="time"
                    value={row.openTime}
                    disabled={row.isClosed}
                    onChange={(event) => {
                      const next = [...availabilityWindows];
                      next[index] = {
                        ...row,
                        dayOfWeek: index,
                        openTime: event.target.value,
                      };
                      form.setValue("availabilityWindows", next, { shouldDirty: true });
                    }}
                    className="h-11 rounded-[12px] bg-muted/50 border-border/50 font-medium focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3]"
                  />
                  <Input
                    type="time"
                    value={row.closeTime}
                    disabled={row.isClosed}
                    onChange={(event) => {
                      const next = [...availabilityWindows];
                      next[index] = {
                        ...row,
                        dayOfWeek: index,
                        closeTime: event.target.value,
                      };
                      form.setValue("availabilityWindows", next, { shouldDirty: true });
                    }}
                    className="h-11 rounded-[12px] bg-muted/50 border-border/50 font-medium focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3]"
                  />
                  <label className="flex items-center gap-3 text-sm font-bold text-slate-500 cursor-pointer">
                    <Checkbox
                      checked={row.isClosed || false}
                      onCheckedChange={(checked) => {
                        const next = [...availabilityWindows];
                        next[index] = {
                          ...row,
                          dayOfWeek: index,
                          isClosed: checked === true,
                        };
                        form.setValue("availabilityWindows", next, { shouldDirty: true });
                      }}
                      className="rounded-[6px] w-5 h-5 border-border/50 data-[state=checked]:bg-[#ED6A5E] data-[state=checked]:border-[#ED6A5E]"
                    />
                    Closed
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-foreground">Brand Logo</FormLabel>
                <FormControl>
                  <div className="flex gap-4 items-center">
                    <Input 
                      type="file" 
                      accept="image/*"
                      disabled={isUploadingLogo}
                      className="h-12 rounded-[14px] bg-muted/50 border-border/50 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-[10px] file:border-0 file:text-sm file:font-bold file:bg-[#377771]/10 file:text-[#377771] dark:file:bg-[#4CE0B3]/10 dark:file:text-[#4CE0B3] cursor-pointer"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploadingLogo(true);
                        try {
                          const res = await UploadServices.uploadImage(file);
                          field.onChange(res.data?.url || "");
                          toast.success("Logo uploaded!");
                        } catch (err) {
                          toast.error("Failed to upload logo.");
                        } finally {
                          setIsUploadingLogo(false);
                        }
                      }} 
                    />
                    {field.value && (
                      <img src={field.value} alt="Logo" className="w-12 h-12 object-cover rounded-[10px] shadow-sm border border-border/50 shrink-0" />
                    )}
                  </div>
                </FormControl>
                <p className="text-xs text-slate-500 font-medium">{isUploadingLogo ? "Uploading logo..." : "Upload a square logo for your restaurant."}</p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bannerImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-foreground">Cover Banner</FormLabel>
                <FormControl>
                  <div className="flex gap-4 items-center">
                    <Input 
                      type="file" 
                      accept="image/*"
                      disabled={isUploadingBanner}
                      className="h-12 rounded-[14px] bg-muted/50 border-border/50 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-[10px] file:border-0 file:text-sm file:font-bold file:bg-[#377771]/10 file:text-[#377771] dark:file:bg-[#4CE0B3]/10 dark:file:text-[#4CE0B3] cursor-pointer"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploadingBanner(true);
                        try {
                          const res = await UploadServices.uploadImage(file);
                          field.onChange(res.data?.url || "");
                          toast.success("Banner uploaded!");
                        } catch (err) {
                          toast.error("Failed to upload banner.");
                        } finally {
                          setIsUploadingBanner(false);
                        }
                      }} 
                    />
                    {field.value && (
                      <img src={field.value} alt="Banner" className="w-24 h-12 object-cover rounded-[10px] shadow-sm border border-border/50 shrink-0" />
                    )}
                  </div>
                </FormControl>
                <p className="text-xs text-slate-500 font-medium">{isUploadingBanner ? "Uploading banner..." : "Upload a promotional cover banner (16:9)."}</p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="pt-6 border-t border-border/50 flex justify-end">
          <Button type="submit" className="w-full sm:w-auto h-12 px-8 rounded-[14px] bg-[#ED6A5E] hover:bg-[#FF8E72] text-white font-bold shadow-md hover:-translate-y-0.5 transition-all" disabled={isSubmitting}>
            {isSubmitting ? "Saving Changes..." : initialData ? "Save Profile Changes" : "Create Profile"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
