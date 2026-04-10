"use client";

import { useEffect, useState } from "react";
import ProfileForm from "@/components/modules/Provider/ProfileForm";
import { ProviderProfileServices } from "@/services/providerProfile.services";
import { IProviderProfile } from "@/types/user.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function ProviderProfilePage() {
  const [profile, setProfile] = useState<IProviderProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await ProviderProfileServices.getMyProfile();
        setProfile(response.data);
      } catch (error: any) {
        // Specifically ignoring 404 since it means the profile isn't created yet
        if (error.response?.status !== 404) {
          toast.error("Failed to load profile");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card className="max-w-2xl mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Restaurant Profile</CardTitle>
          <CardDescription>
            {profile ? "Update your restaurant details below." : "Create your restaurant profile to get started."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm initialData={profile} />
        </CardContent>
      </Card>
    </div>
  );
}
