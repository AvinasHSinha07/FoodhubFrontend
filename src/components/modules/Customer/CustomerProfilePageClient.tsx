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
    <div className="max-w-4xl mx-auto py-10 space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-[#ED6A5E]/10 p-3 rounded-[16px]">
          <UserCircle className="w-8 h-8 text-[#ED6A5E]" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">My Profile</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your account settings and preferences.</p>
        </div>
      </div>

      <Card className="rounded-[24px] border-border/50 shadow-sm bg-background overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/20 pb-6 pt-8 px-8">
          <CardTitle className="text-2xl font-extrabold text-foreground">Personal Information</CardTitle>
          <CardDescription className="text-slate-500 font-medium text-base mt-1">Update your personal details, avatar, and account preferences.</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form className="space-y-8" onSubmit={handleUpdate}>
            <div className="space-y-4">
              <label className="text-sm font-bold text-foreground">Profile Avatar</label>
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 border-4 border-background shadow-md">
                  <AvatarImage src={profile?.image || ""} alt={profile?.name || "User"} className="object-cover" />
                  <AvatarFallback className="bg-[#377771]/10 text-[#377771] text-2xl font-bold">{profile?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2 max-w-sm">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={isUploadingAvatar}
                    className="h-12 rounded-[14px] bg-muted/50 border-border/50 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-[10px] file:border-0 file:text-sm file:font-bold file:bg-[#ED6A5E]/10 file:text-[#ED6A5E] hover:file:bg-[#ED6A5E]/20 file:transition-colors cursor-pointer"
                  />
                  <p className="text-xs text-slate-500 font-medium">
                    {isUploadingAvatar ? "Uploading avatar..." : "Upload a square image for best results. Max 5MB."}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="bg-border/50" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground">Email Address</label>
                <Input value={profile?.email || ""} disabled className="h-12 rounded-[14px] bg-muted border-border/50 text-slate-500 cursor-not-allowed font-medium" />
                <p className="text-xs text-slate-500 font-medium">Your email address cannot be changed.</p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground">Account Role</label>
                <div className="h-12 px-4 flex items-center border border-border/50 rounded-[14px] bg-muted/50 text-sm font-extrabold text-[#377771] dark:text-[#4CE0B3] capitalize tracking-wide">{profile?.role?.toLowerCase() || "Customer"}</div>
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="text-sm font-bold text-foreground">Full Name</label>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  placeholder="Enter your full name"
                  className="h-12 rounded-[14px] bg-background border-border/50 focus-visible:ring-[#ED6A5E] focus-visible:border-[#ED6A5E] font-medium"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-border/50 flex justify-end">
              <Button type="submit" disabled={isUpdating} className="w-full sm:w-auto h-12 px-8 rounded-[14px] bg-[#ED6A5E] hover:bg-[#FF8E72] text-white font-bold shadow-md hover:-translate-y-0.5 transition-all">
                {isUpdating ? "Updating Profile..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-[24px] border-border/50 shadow-sm bg-background overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/20 pb-6 pt-8 px-8">
          <CardTitle className="flex items-center gap-3 text-2xl font-extrabold text-foreground">
            <div className="bg-[#377771]/10 p-2 rounded-[12px]">
              <MapPinHouse className="h-6 w-6 text-[#377771] dark:text-[#4CE0B3]" />
            </div>
            Saved Addresses
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium text-base mt-1">Manage delivery addresses and set a default one for faster checkout.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-8">
          <form className="grid grid-cols-1 gap-5 md:grid-cols-2 bg-muted/20 p-6 rounded-[24px] border border-border/50" onSubmit={handleSubmitAddress}>
            <div className="md:col-span-2 mb-2">
              <h3 className="text-lg font-bold text-foreground">{addressForm.id ? "Edit Address" : "Add New Address"}</h3>
            </div>
            <Input
              placeholder="Label (Home, Office)"
              value={addressForm.label}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, label: event.target.value }))}
              required
              className="h-12 rounded-[14px] bg-background border-border/50 focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3]"
            />
            <Input
              placeholder="Address line 1"
              value={addressForm.line1}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, line1: event.target.value }))}
              required
              className="h-12 rounded-[14px] bg-background border-border/50 focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3]"
            />
            <Input
              placeholder="Address line 2 (optional)"
              value={addressForm.line2}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, line2: event.target.value }))}
              className="h-12 rounded-[14px] bg-background border-border/50 focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3]"
            />
            <Input
              placeholder="City"
              value={addressForm.city}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, city: event.target.value }))}
              required
              className="h-12 rounded-[14px] bg-background border-border/50 focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3]"
            />
            <Input
              placeholder="State / Province"
              value={addressForm.state}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, state: event.target.value }))}
              className="h-12 rounded-[14px] bg-background border-border/50 focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3]"
            />
            <Input
              placeholder="Postal code"
              value={addressForm.postalCode}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, postalCode: event.target.value }))}
              className="h-12 rounded-[14px] bg-background border-border/50 focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3]"
            />
            <Input
              placeholder="Country"
              value={addressForm.country}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, country: event.target.value }))}
              className="h-12 rounded-[14px] bg-background border-border/50 focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3]"
            />
            <Input
              placeholder="Delivery instructions (e.g. gate code)"
              value={addressForm.instructions}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, instructions: event.target.value }))}
              className="h-12 rounded-[14px] bg-background border-border/50 focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3]"
            />

            <label className="col-span-1 flex items-center gap-3 text-sm md:col-span-2 font-bold cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={addressForm.isDefault}
                className="w-5 h-5 rounded-[6px] border-border/50 text-[#377771] focus:ring-[#377771] bg-background cursor-pointer"
                onChange={(event) =>
                  setAddressForm((prev) => ({
                    ...prev,
                    isDefault: event.target.checked,
                  }))
                }
              />
              Set as default delivery address
            </label>

            <div className="col-span-1 flex flex-wrap gap-3 md:col-span-2 mt-2">
              <Button type="submit" disabled={isCreatingAddress || isUpdatingAddress} className="h-12 px-8 rounded-[14px] bg-[#377771] dark:bg-[#4CE0B3] text-white dark:text-emerald-950 hover:bg-[#2A5A55] dark:hover:bg-[#34D399] font-bold shadow-md hover:-translate-y-0.5 transition-all">
                {addressForm.id ? "Update Address" : "Save New Address"}
              </Button>
              {addressForm.id && (
                <Button type="button" variant="outline" onClick={resetAddressForm} className="h-12 px-8 rounded-[14px] font-bold border-border/50 text-foreground hover:bg-muted">
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>

          <Separator className="bg-border/50" />

          <div className="space-y-4">
            <h3 className="text-xl font-extrabold text-foreground mb-4">Your Addresses</h3>
            {addresses.length === 0 ? (
              <div className="p-8 text-center bg-muted/30 rounded-[24px] border border-border/50">
                <MapPinHouse className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-base font-bold text-slate-500">No saved addresses yet.</p>
                <p className="text-sm font-medium text-slate-400 mt-1">Add an address above to use it during checkout.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <div key={address.id} className={`rounded-[20px] border p-6 flex flex-col justify-between transition-all duration-300 ${address.isDefault ? "bg-[#377771]/5 border-[#377771]/30 dark:bg-[#4CE0B3]/5 dark:border-[#4CE0B3]/30 shadow-sm" : "bg-background border-border/50 hover:border-border hover:shadow-sm"}`}>
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-extrabold text-lg text-foreground tracking-tight">{address.label}</h4>
                        {address.isDefault && (
                          <span className="bg-[#377771] dark:bg-[#4CE0B3] text-white dark:text-emerald-950 text-[10px] uppercase tracking-wider font-extrabold px-2 py-1 rounded-full flex items-center">
                            <Star className="w-3 h-3 fill-current mr-1" /> Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ""}<br />
                        {address.city}{address.state ? `, ${address.state}` : ""}{address.postalCode ? ` ${address.postalCode}` : ""}<br />
                        {address.country}
                      </p>
                      {address.instructions && (
                        <div className="mt-3 bg-muted p-3 rounded-[12px] text-xs font-medium text-slate-500">
                          <span className="font-bold text-foreground">Note:</span> {address.instructions}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50 mt-auto">
                      {!address.isDefault && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetDefaultAddress(address.id)}
                          disabled={isSettingDefaultAddress}
                          className="rounded-[10px] font-bold border-border/50 hover:bg-[#377771]/10 hover:text-[#377771] dark:hover:bg-[#4CE0B3]/10 dark:hover:text-[#4CE0B3]"
                        >
                          Make Default
                        </Button>
                      )}
                      <Button type="button" size="sm" variant="outline" onClick={() => handleEditAddress(address)} className="rounded-[10px] font-bold border-border/50 hover:bg-muted">
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="rounded-[10px] font-bold text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                        onClick={() => handleDeleteAddress(address.id)}
                        disabled={isDeletingAddress}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
