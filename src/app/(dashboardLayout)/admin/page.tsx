import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import AdminDashboardPageClient from "@/components/modules/Admin/AdminDashboardPageClient";
import { queryKeys } from "@/lib/query/query-keys";
import { AdminServices } from "@/services/admin.services";
import { CategoryServices } from "@/services/category.services";
import { ProviderProfileServices } from "@/services/providerProfile.services";

export const dynamic = "force-dynamic";

const DASHBOARD_COUNT_QUERY = "page=1&limit=1";

const AdminDashboardPage = async () => {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.adminUsers(DASHBOARD_COUNT_QUERY),
      queryFn: () => AdminServices.getAllUsers({ page: 1, limit: 1 }),
      staleTime: 1000 * 60 * 5,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.adminOrders(DASHBOARD_COUNT_QUERY),
      queryFn: () => AdminServices.getAllOrders({ page: 1, limit: 1 }),
      staleTime: 1000 * 60 * 3,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.providers(DASHBOARD_COUNT_QUERY),
      queryFn: () => ProviderProfileServices.getAllProviders({ page: 1, limit: 1 }),
      staleTime: 1000 * 60 * 10,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.categories(),
      queryFn: () => CategoryServices.getCategories(),
      staleTime: 1000 * 60 * 60,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminDashboardPageClient />
    </HydrationBoundary>
  );
};

export default AdminDashboardPage;
