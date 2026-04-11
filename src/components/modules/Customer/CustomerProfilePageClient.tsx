"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserServices } from "@/services/user.services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { UserCircle } from "lucide-react";
import { queryKeys } from "@/lib/query/query-keys";

export default function CustomerProfilePageClient() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.myUserProfile(),
    queryFn: () => UserServices.getMyProfile(),
    staleTime: 1000 * 60 * 5,
  });

  const profile = data?.data;

  useEffect(() => {
    if (profile) {
      setName(profile?.name || "");
    }
  }, [profile]);

  const { mutateAsync: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: (payload: { name?: string; profileImage?: string }) =>
      UserServices.updateMyProfile(payload),
  });

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await updateProfile({ name });
      if (response.success) {
        toast.success("Profile updated successfully!");
        await queryClient.invalidateQueries({ queryKey: queryKeys.myUserProfile() });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update profile.");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-10 space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <UserCircle className="w-8 h-8 text-orange-600" />
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details here.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleUpdate}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input value={profile?.email || ""} disabled className="bg-gray-100" />
              <p className="text-xs text-gray-500">Your email address cannot be changed.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <div className="px-3 py-2 border rounded bg-gray-50 text-sm capitalize">{profile?.role?.toLowerCase() || "Customer"}</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Name</label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="pt-4 border-t">
              <Button type="submit" disabled={isUpdating} className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white">
                {isUpdating ? "Updating..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
