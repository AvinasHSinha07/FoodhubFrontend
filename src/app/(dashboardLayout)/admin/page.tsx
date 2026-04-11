import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import AdminDashboardPageClient from "@/components/modules/Admin/AdminDashboardPageClient";
import { queryKeys } from "@/lib/query/query-keys";
import { AdminServices } from "@/services/admin.services";
import { CategoryServices } from "@/services/category.services";
import { ProviderProfileServices } from "@/services/providerProfile.services";

export const dynamic = "force-dynamic";

const AdminDashboardPage = async () => {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.adminUsers(""),
      queryFn: () => AdminServices.getAllUsers(),
      staleTime: 1000 * 60 * 5,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.adminOrders(),
      queryFn: () => AdminServices.getAllOrders(),
      staleTime: 1000 * 60 * 3,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.providers(""),
      queryFn: () => ProviderProfileServices.getAllProviders({ page: 1, limit: 10 }),
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
