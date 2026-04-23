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
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Active</Badge>;
      case UserStatus.BLOCKED:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">Blocked</Badge>;
      case UserStatus.DELETED:
        return <Badge variant="secondary">Deleted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
      case "SUPER_ADMIN":
        return <Shield className="h-4 w-4 text-purple-600" />;
      case "PROVIDER":
        return <UserCheck className="h-4 w-4 text-blue-600" />;
      default:
        return <UserX className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-gray-500">View and manage all platform accounts.</p>
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
            className="max-w-md bg-white"
          />
        </form>
        <Select value={filterRole} onValueChange={(value) => updateParams({ role: value, page: "1" })}>
          <SelectTrigger className="w-45 bg-white">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="CUSTOMER">Customers</SelectItem>
            <SelectItem value="PROVIDER">Providers</SelectItem>
            <SelectItem value="ADMIN">Admins</SelectItem>
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
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : isError ? (
        <Card className="text-center py-20 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-700">Unable to load users</h2>
          <p className="text-gray-500 mt-2">{getApiErrorMessage(error, "Please refresh and try again.")}</p>
        </Card>
      ) : users.length === 0 ? (
        <Card className="text-center py-20 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-700">No users found</h2>
          <p className="text-gray-500 mt-2">Try adjusting your search criteria.</p>
        </Card>
      ) : (
        <>
          <div className="bg-white rounded-md border shadow-sm overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b text-gray-600 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span className="font-medium text-xs">{user.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Select
                        defaultValue={user.status}
                        onValueChange={(val) => handleStatusChange(user.id, val as UserStatus)}
                        disabled={user.role === "SUPER_ADMIN" || isUpdating}
                      >
                        <SelectTrigger className="w-27.5 h-8 text-xs ml-auto">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={UserStatus.ACTIVE}>Activate</SelectItem>
                          <SelectItem value={UserStatus.BLOCKED}>Block</SelectItem>
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
