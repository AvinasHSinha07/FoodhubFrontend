"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserServices } from "@/services/user.services";
import { UploadServices } from "@/services/upload.services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { UserCircle, Trash2, Star, MapPinHouse } from "lucide-react";
import { queryKeys } from "@/lib/query/query-keys";
import { ICustomerAddress } from "@/types/user.types";

type AddressFormState = {
  id?: string;
  label: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  instructions: string;
  isDefault: boolean;
};

const defaultAddressFormState: AddressFormState = {
  label: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Bangladesh",
  instructions: "",
  isDefault: false,
};

export default function CustomerProfilePageClient() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [addressForm, setAddressForm] = useState<AddressFormState>(defaultAddressFormState);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.myUserProfile(),
    queryFn: () => UserServices.getMyProfile(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: addressesResponse } = useQuery({
    queryKey: queryKeys.myAddresses(),
    queryFn: () => UserServices.getMyAddresses(),
    staleTime: 1000 * 60 * 2,
  });

  const profile = data?.data;
  const addresses = (addressesResponse?.data || []) as ICustomerAddress[];

  useEffect(() => {
    if (profile) {
      setName(profile?.name || "");
    }
  }, [profile]);

  const { mutateAsync: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: (payload: { name?: string; profileImage?: string }) =>
      UserServices.updateMyProfile(payload),
  });

  const { mutateAsync: createAddress, isPending: isCreatingAddress } = useMutation({
    mutationFn: UserServices.createAddress,
  });

  const { mutateAsync: updateAddress, isPending: isUpdatingAddress } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => UserServices.updateAddress(id, payload),
  });

  const { mutateAsync: deleteAddress, isPending: isDeletingAddress } = useMutation({
    mutationFn: (id: string) => UserServices.deleteAddress(id),
  });

  const { mutateAsync: setDefaultAddress, isPending: isSettingDefaultAddress } = useMutation({
    mutationFn: (id: string) => UserServices.setDefaultAddress(id),
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const uploadResponse = await UploadServices.uploadImage(file);
      const imageUrl = uploadResponse.data?.url;

      if (!imageUrl) {
        throw new Error("No image URL returned");
      }

      await updateProfile({ profileImage: imageUrl });
      toast.success("Avatar updated successfully!");
      await queryClient.invalidateQueries({ queryKey: queryKeys.myUserProfile() });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to upload avatar.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const resetAddressForm = () => {
    setAddressForm(defaultAddressFormState);
  };

  const handleSubmitAddress = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      label: addressForm.label,
      line1: addressForm.line1,
      line2: addressForm.line2 || undefined,
      city: addressForm.city,
      state: addressForm.state || undefined,
      postalCode: addressForm.postalCode || undefined,
      country: addressForm.country || "Bangladesh",
      instructions: addressForm.instructions || undefined,
      isDefault: addressForm.isDefault,
    };

    try {
      if (addressForm.id) {
        await updateAddress({ id: addressForm.id, payload });
        toast.success("Address updated successfully!");
      } else {
        await createAddress(payload);
        toast.success("Address added successfully!");
      }

      resetAddressForm();
      await queryClient.invalidateQueries({ queryKey: queryKeys.myAddresses() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.myUserProfile() });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save address.");
    }
  };

  const handleEditAddress = (address: ICustomerAddress) => {
    setAddressForm({
      id: address.id,
      label: address.label,
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      state: address.state || "",
      postalCode: address.postalCode || "",
      country: address.country || "Bangladesh",
      instructions: address.instructions || "",
      isDefault: address.isDefault,
    });
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await deleteAddress(id);
      toast.success("Address removed.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.myAddresses() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.myUserProfile() });
      if (addressForm.id === id) {
        resetAddressForm();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete address.");
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await setDefaultAddress(id);
      toast.success("Default address updated.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.myAddresses() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.myUserProfile() });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to set default address.");
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
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <UserCircle className="w-8 h-8 text-orange-600" />
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details, avatar, and saved checkout addresses.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleUpdate}>
            <div className="space-y-3">
              <label className="text-sm font-medium">Profile Avatar</label>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile?.image || ""} alt={profile?.name || "User"} />
                  <AvatarFallback>{profile?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                  className="max-w-sm"
                />
              </div>
              <p className="text-xs text-gray-500">
                {isUploadingAvatar ? "Uploading avatar..." : "Upload a square image for best results."}
              </p>
            </div>

            <Separator />

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPinHouse className="h-5 w-5 text-orange-600" /> Saved Addresses
          </CardTitle>
          <CardDescription>Manage delivery addresses and set a default one for faster checkout.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={handleSubmitAddress}>
            <Input
              placeholder="Label (Home, Office)"
              value={addressForm.label}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, label: event.target.value }))}
              required
            />
            <Input
              placeholder="Address line 1"
              value={addressForm.line1}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, line1: event.target.value }))}
              required
            />
            <Input
              placeholder="Address line 2 (optional)"
              value={addressForm.line2}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, line2: event.target.value }))}
            />
            <Input
              placeholder="City"
              value={addressForm.city}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, city: event.target.value }))}
              required
            />
            <Input
              placeholder="State"
              value={addressForm.state}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, state: event.target.value }))}
            />
            <Input
              placeholder="Postal code"
              value={addressForm.postalCode}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, postalCode: event.target.value }))}
            />
            <Input
              placeholder="Country"
              value={addressForm.country}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, country: event.target.value }))}
            />
            <Input
              placeholder="Delivery instructions"
              value={addressForm.instructions}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, instructions: event.target.value }))}
            />

            <label className="col-span-1 flex items-center gap-2 text-sm md:col-span-2">
              <input
                type="checkbox"
                checked={addressForm.isDefault}
                onChange={(event) =>
                  setAddressForm((prev) => ({
                    ...prev,
                    isDefault: event.target.checked,
                  }))
                }
              />
              Set as default address
            </label>

            <div className="col-span-1 flex gap-2 md:col-span-2">
              <Button type="submit" disabled={isCreatingAddress || isUpdatingAddress}>
                {addressForm.id ? "Update Address" : "Add Address"}
              </Button>
              {addressForm.id && (
                <Button type="button" variant="outline" onClick={resetAddressForm}>
                  Cancel Editing
                </Button>
              )}
            </div>
          </form>

          <Separator />

          <div className="space-y-3">
            {addresses.length === 0 ? (
              <p className="text-sm text-gray-500">No saved addresses yet.</p>
            ) : (
              addresses.map((address) => (
                <div key={address.id} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">
                        {address.label} {address.isDefault ? <span className="ml-1 text-xs text-green-600">(Default)</span> : null}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ""}, {address.city}
                        {address.state ? `, ${address.state}` : ""}
                        {address.postalCode ? `, ${address.postalCode}` : ""}, {address.country}
                      </p>
                      {address.instructions ? (
                        <p className="mt-1 text-xs text-gray-500">Instructions: {address.instructions}</p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {!address.isDefault && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetDefaultAddress(address.id)}
                          disabled={isSettingDefaultAddress}
                        >
                          <Star className="mr-1 h-3.5 w-3.5" />
                          Set Default
                        </Button>
                      )}
                      <Button type="button" size="sm" variant="outline" onClick={() => handleEditAddress(address)}>
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-red-600"
                        onClick={() => handleDeleteAddress(address.id)}
                        disabled={isDeletingAddress}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
