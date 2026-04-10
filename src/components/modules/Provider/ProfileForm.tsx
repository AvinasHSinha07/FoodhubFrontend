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
import { IProviderProfile } from "@/types/user.types";
import { useState } from "react";

export default function ProfileForm({
  initialData,
}: {
  initialData?: IProviderProfile | null;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

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

        {/* Temporary URL inputs for images until Cloudinary widget is fully integrated */}
        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/logo.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bannerImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banner Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/banner.png" {...field} />
              </FormControl>
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
