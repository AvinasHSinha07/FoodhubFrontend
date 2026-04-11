import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import ProviderOrdersPageClient from "@/components/modules/Provider/ProviderOrdersPageClient";
import { buildQueryString } from "@/lib/query/build-query-string";
import { getOrderFiltersFromSearchParams } from "@/lib/query/order-filters";
import { queryKeys } from "@/lib/query/query-keys";
import { OrderServices } from "@/services/order.services";

export const dynamic = "force-dynamic";

type ProviderOrdersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const ProviderOrdersPage = async ({ searchParams }: ProviderOrdersPageProps) => {
  const resolvedSearchParams = await searchParams;
  const queryString = buildQueryString(resolvedSearchParams);
  const filters = getOrderFiltersFromSearchParams(new URLSearchParams(queryString));

  const queryClient = new QueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.providerOrders(queryString),
      queryFn: () => OrderServices.getProviderOrders(filters),
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
