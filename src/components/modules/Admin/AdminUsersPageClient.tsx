"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AdminServices } from "@/services/admin.services";
import { IUser, UserStatus } from "@/types/user.types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { UserCheck, UserX, Shield } from "lucide-react";
import { queryKeys } from "@/lib/query/query-keys";
import { getAdminUsersFiltersFromSearchParams } from "@/lib/query/admin-users-filters";
import PaginationControls from "@/components/shared/list/PaginationControls";
import SortControl from "@/components/shared/list/SortControl";
import { getApiErrorMessage } from "@/lib/api-error";

export default function AdminUsersPageClient() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const queryString = searchParams?.toString() || "";
  const search = searchParams?.get("search") || "";
  const filterRole = searchParams?.get("role") || "ALL";
  const sortValue = `${searchParams?.get("sortBy") || "createdAt"}:${searchParams?.get("sortOrder") || "desc"}`;

  const filters = useMemo(() => {
    const parsed = getAdminUsersFiltersFromSearchParams(new URLSearchParams(queryString));

    return {
      ...parsed,
      role: parsed.role === "ALL" ? undefined : parsed.role,
    };
  }, [queryString]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.adminUsers(queryString),
    queryFn: () => AdminServices.getAllUsers(filters),
    staleTime: 1000 * 60 * 3,
  });

  const users = (data?.data || []) as IUser[];
  const usersMeta = data?.meta;

  const { mutateAsync: updateUserStatus, isPending: isUpdating } = useMutation({
    mutationFn: ({ userId, newStatus }: { userId: string; newStatus: UserStatus }) =>
      AdminServices.updateUserStatus(userId, newStatus),
  });

  const updateParams = (updates: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams?.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "ALL") {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    });

    const nextQueryString = nextParams.toString();
    router.replace(nextQueryString ? `${pathname}?${nextQueryString}` : pathname, { scroll: false });
  };

  const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
    try {
      await updateUserStatus({ userId, newStatus });
      toast.success(`User set to ${newStatus}`);
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers(queryString) });
    } catch (mutationError: unknown) {
      toast.error(getApiErrorMessage(mutationError, "Failed to update status"));
    }
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split(":");
    updateParams({ sortBy, sortOrder, page: "1" });
  };

  const handlePageChange = (nextPage: number) => {
    updateParams({ page: String(nextPage) });
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return <Badge className="bg-[#377771]/10 text-[#377771] border-[#377771]/20 dark:bg-[#4CE0B3]/10 dark:text-[#4CE0B3] dark:border-[#4CE0B3]/20 font-bold px-3 py-1 rounded-[8px] tracking-wide">Active</Badge>;
      case UserStatus.BLOCKED:
        return <Badge className="bg-[#ED6A5E]/10 text-[#ED6A5E] border-[#ED6A5E]/20 font-bold px-3 py-1 rounded-[8px] tracking-wide">Blocked</Badge>;
      case UserStatus.DELETED:
        return <Badge className="bg-muted text-slate-500 border-border/50 font-bold px-3 py-1 rounded-[8px] tracking-wide">Deleted</Badge>;
      default:
        return <Badge variant="outline" className="font-bold px-3 py-1 rounded-[8px] tracking-wide">{status}</Badge>;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
      case "SUPER_ADMIN":
        return <div className="bg-[#ED6A5E]/10 p-1.5 rounded-[8px]"><Shield className="h-4 w-4 text-[#ED6A5E]" /></div>;
      case "PROVIDER":
        return <div className="bg-[#377771]/10 p-1.5 rounded-[8px]"><UserCheck className="h-4 w-4 text-[#377771] dark:text-[#4CE0B3]" /></div>;
      default:
        return <div className="bg-muted p-1.5 rounded-[8px]"><UserX className="h-4 w-4 text-slate-500" /></div>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">User Management</h1>
        <p className="text-slate-500 font-medium mt-1">View and manage all platform accounts.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const target = event.currentTarget.elements.namedItem("search") as HTMLInputElement | null;
            updateParams({ search: target?.value || null, page: "1" });
          }}
          className="flex-1"
        >
          <Input
            name="search"
            placeholder="Search by name or email..."
            defaultValue={search}
            className="max-w-md h-12 rounded-[14px] bg-background border-border/50 focus-visible:ring-[#377771] dark:focus-visible:ring-[#4CE0B3] font-medium"
          />
        </form>
        <Select value={filterRole} onValueChange={(value) => updateParams({ role: value, page: "1" })}>
          <SelectTrigger className="w-[180px] h-12 rounded-[14px] bg-background border-border/50 font-bold">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent className="rounded-[16px] border-border/50">
            <SelectItem value="ALL" className="font-bold">All Roles</SelectItem>
            <SelectItem value="CUSTOMER" className="font-bold">Customers</SelectItem>
            <SelectItem value="PROVIDER" className="font-bold">Providers</SelectItem>
            <SelectItem value="ADMIN" className="font-bold">Admins</SelectItem>
          </SelectContent>
        </Select>
        <SortControl
          value={sortValue}
          onValueChange={handleSortChange}
          options={[
            { label: "Newest", value: "createdAt:desc" },
            { label: "Oldest", value: "createdAt:asc" },
            { label: "Name: A-Z", value: "name:asc" },
            { label: "Name: Z-A", value: "name:desc" },
            { label: "Email: A-Z", value: "email:asc" },
            { label: "Email: Z-A", value: "email:desc" },
          ]}
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[400px] w-full rounded-[24px]" />
        </div>
      ) : isError ? (
        <Card className="text-center py-24 bg-background border-border/50 rounded-[24px] shadow-sm">
          <h2 className="text-2xl font-extrabold text-foreground">Unable to load users</h2>
          <p className="text-slate-500 font-medium mt-2">{getApiErrorMessage(error, "Please refresh and try again.")}</p>
        </Card>
      ) : users.length === 0 ? (
        <Card className="text-center py-24 bg-background border-border/50 rounded-[24px] shadow-sm">
          <h2 className="text-2xl font-extrabold text-foreground">No users found</h2>
          <p className="text-slate-500 font-medium mt-2">Try adjusting your search criteria.</p>
        </Card>
      ) : (
        <>
          <div className="bg-background rounded-[24px] border border-border/50 shadow-sm overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 border-b border-border/50 text-slate-500 uppercase text-xs font-bold tracking-widest">
                <tr>
                  <th className="px-8 py-5">User</th>
                  <th className="px-8 py-5">Role</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Joined</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-8 py-5">
                      <div className="font-bold text-foreground text-base">{user.name}</div>
                      <div className="text-xs font-medium text-slate-500 mt-0.5">{user.email}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        {getRoleIcon(user.role)}
                        <span className="font-bold text-sm tracking-wide">{user.role}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">{getStatusBadge(user.status)}</td>
                    <td className="px-8 py-5 text-slate-500 font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Select
                        defaultValue={user.status}
                        onValueChange={(val) => handleStatusChange(user.id, val as UserStatus)}
                        disabled={user.role === "SUPER_ADMIN" || isUpdating}
                      >
                        <SelectTrigger className="w-[120px] h-9 rounded-[10px] text-xs font-bold bg-background border-border/50 ml-auto focus:ring-[#377771] dark:focus:ring-[#4CE0B3]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[12px] border-border/50">
                          <SelectItem value={UserStatus.ACTIVE} className="font-bold text-xs">Activate</SelectItem>
                          <SelectItem value={UserStatus.BLOCKED} className="font-bold text-xs">Block</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationControls meta={usersMeta} onPageChange={handlePageChange} isLoading={isLoading} />
        </>
      )}
    </div>
  );
}
