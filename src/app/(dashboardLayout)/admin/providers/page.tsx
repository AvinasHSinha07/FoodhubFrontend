import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import AdminProvidersPageClient from "@/components/modules/Admin/AdminProvidersPageClient";
import { queryKeys } from "@/lib/query/query-keys";
import { ProviderProfileServices } from "@/services/providerProfile.services";

export const dynamic = "force-dynamic";

const AdminProvidersPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.providers(""),
    queryFn: () => ProviderProfileServices.getAllProviders(),
    staleTime: 1000 * 60 * 10,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminProvidersPageClient />
    </HydrationBoundary>
  );
};

export default AdminProvidersPage;
