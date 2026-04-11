"use client";

import { useQuery } from "@tanstack/react-query";
import ProfileForm from "@/components/modules/Provider/ProfileForm";
import { ProviderProfileServices } from "@/services/providerProfile.services";
import { IProviderProfile } from "@/types/user.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function ProviderProfilePageClient() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.myProviderProfile(),
    queryFn: () => getProviderProfileSafely(),
    staleTime: 1000 * 60 * 5,
  });

  const profile = (data?.data || null) as IProviderProfile | null;

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
