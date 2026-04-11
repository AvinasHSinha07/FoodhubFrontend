import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import ProviderOrdersPageClient from "@/components/modules/Provider/ProviderOrdersPageClient";
import { queryKeys } from "@/lib/query/query-keys";
import { OrderServices } from "@/services/order.services";

export const dynamic = "force-dynamic";

const ProviderOrdersPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.providerOrders(),
    queryFn: () => OrderServices.getCustomerOrders(),
    staleTime: 1000 * 60 * 2,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProviderOrdersPageClient />
    </HydrationBoundary>
  );
};

export default ProviderOrdersPage;
