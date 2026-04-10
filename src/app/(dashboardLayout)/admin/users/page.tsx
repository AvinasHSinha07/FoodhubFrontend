"use client";

import { useEffect, useState } from "react";
import { AdminServices } from "@/services/admin.services";
import { IUser, UserStatus } from "@/types/user.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { UserCheck, UserX, Shield } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const filters: any = {};
      if (filterRole !== "ALL") filters.role = filterRole;
      if (search) filters.searchTerm = search;

      const response = await AdminServices.getAllUsers(filters);
      setUsers(response.data || []);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
    try {
      await AdminServices.updateUserStatus(userId, newStatus);
      toast.success(`User set to ${newStatus}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
    } catch (error) {
      toast.error("Failed to update status");
    }
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
      case "ADMIN": case "SUPER_ADMIN": return <Shield className="h-4 w-4 text-purple-600" />;
      case "PROVIDER": return <UserCheck className="h-4 w-4 text-blue-600" />;
      default: return <UserX className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-gray-500">View and manage all platform accounts.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <Input 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md bg-white"
          />
        </form>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="CUSTOMER">Customers</SelectItem>
            <SelectItem value="PROVIDER">Providers</SelectItem>
            <SelectItem value="ADMIN">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : users.length === 0 ? (
        <Card className="text-center py-20 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-700">No users found</h2>
          <p className="text-gray-500 mt-2">Try adjusting your search criteria.</p>
        </Card>
      ) : (
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
                      disabled={user.role === 'SUPER_ADMIN'}
                    >
                      <SelectTrigger className="w-[110px] h-8 text-xs ml-auto">
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
      )}
    </div>
  );
}
