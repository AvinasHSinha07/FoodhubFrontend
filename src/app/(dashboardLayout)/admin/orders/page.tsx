import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import AdminOrdersPageClient from "@/components/modules/Admin/AdminOrdersPageClient";
import { queryKeys } from "@/lib/query/query-keys";
import { AdminServices } from "@/services/admin.services";

export const dynamic = "force-dynamic";

const AdminOrdersPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.adminOrders(),
    queryFn: () => AdminServices.getAllOrders(),
    staleTime: 1000 * 60 * 3,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminOrdersPageClient />
    </HydrationBoundary>
  );
};

export default AdminOrdersPage;
