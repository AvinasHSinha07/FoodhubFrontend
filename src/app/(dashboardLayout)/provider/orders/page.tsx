import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import ProviderOrdersPageClient from "@/components/modules/Provider/ProviderOrdersPageClient";
import { queryKeys } from "@/lib/query/query-keys";
import { OrderServices } from "@/services/order.services";

export const dynamic = "force-dynamic";

const ProviderOrdersPage = async () => {
  const queryClient = new QueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.providerOrders(),
      queryFn: () => OrderServices.getProviderOrders(),
      staleTime: 1000 * 60 * 2,
    });
  } catch {
    // Keep rendering and let the client query show an empty/error state.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProviderOrdersPageClient />
    </HydrationBoundary>
  );
};

export default ProviderOrdersPage;
