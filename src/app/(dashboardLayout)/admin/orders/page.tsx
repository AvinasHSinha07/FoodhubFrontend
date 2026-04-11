import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import AdminOrdersPageClient from "@/components/modules/Admin/AdminOrdersPageClient";
import { buildQueryString } from "@/lib/query/build-query-string";
import { getOrderFiltersFromSearchParams } from "@/lib/query/order-filters";
import { queryKeys } from "@/lib/query/query-keys";
import { AdminServices } from "@/services/admin.services";

export const dynamic = "force-dynamic";

type AdminOrdersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const AdminOrdersPage = async ({ searchParams }: AdminOrdersPageProps) => {
  const resolvedSearchParams = await searchParams;
  const queryString = buildQueryString(resolvedSearchParams);
  const filters = getOrderFiltersFromSearchParams(new URLSearchParams(queryString));

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.adminOrders(queryString),
    queryFn: () => AdminServices.getAllOrders(filters),
    staleTime: 1000 * 60 * 3,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminOrdersPageClient />
    </HydrationBoundary>
  );
};

export default AdminOrdersPage;
