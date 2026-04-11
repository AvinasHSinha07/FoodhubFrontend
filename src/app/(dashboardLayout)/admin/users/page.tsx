import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import AdminUsersPageClient from "@/components/modules/Admin/AdminUsersPageClient";
import { buildQueryString } from "@/lib/query/build-query-string";
import { getAdminUsersFiltersFromSearchParams } from "@/lib/query/admin-users-filters";
import { queryKeys } from "@/lib/query/query-keys";
import { AdminServices } from "@/services/admin.services";

export const dynamic = "force-dynamic";

type AdminUsersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const AdminUsersPage = async ({ searchParams }: AdminUsersPageProps) => {
  const resolvedSearchParams = await searchParams;
  const queryString = buildQueryString(resolvedSearchParams);
  const filters = getAdminUsersFiltersFromSearchParams(new URLSearchParams(queryString));

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.adminUsers(queryString),
    queryFn: () =>
      AdminServices.getAllUsers({
        ...filters,
        role: filters.role === "ALL" ? undefined : filters.role,
      }),
    staleTime: 1000 * 60 * 3,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminUsersPageClient />
    </HydrationBoundary>
  );
};

export default AdminUsersPage;
