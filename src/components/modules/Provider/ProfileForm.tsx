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
      logo: initialData?.logo || "",
      bannerImage: initialData?.bannerImage || "",
    },
  });

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="restaurantName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Restaurant Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter restaurant name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter physical address" {...field} />
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="A short description of your restaurant" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cuisineType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cuisine Type (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Italian, Thai, Chinese" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

<FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo Image</FormLabel>
              <FormControl>
                <div className="flex gap-4 items-center">
                  <Input 
                    type="file" 
                    accept="image/*"
                    disabled={isUploadingLogo}
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
                    <img src={field.value} alt="Logo" className="w-12 h-12 object-cover rounded shadow-sm border border-gray-200" />
                  )}
                </div>
              </FormControl>
              <p className="text-xs text-gray-500">{isUploadingLogo ? "Uploading logo..." : "Upload a logo for your restaurant."}</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bannerImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banner Image</FormLabel>
              <FormControl>
                <div className="flex gap-4 items-center">
                  <Input 
                    type="file" 
                    accept="image/*"
                    disabled={isUploadingBanner}
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
                    <img src={field.value} alt="Banner" className="w-24 h-12 object-cover rounded shadow-sm border border-gray-200" />
                  )}
                </div>
              </FormControl>
              <p className="text-xs text-gray-500">{isUploadingBanner ? "Uploading banner..." : "Upload a promotional banner for your page."}</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData ? "Update Profile" : "Create Profile"}
        </Button>
      </form>
    </Form>
  );
}
