import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import CustomerOrdersPageClient from "@/components/modules/Customer/CustomerOrdersPageClient";
import { buildQueryString } from "@/lib/query/build-query-string";
import { getOrderFiltersFromSearchParams } from "@/lib/query/order-filters";
import { queryKeys } from "@/lib/query/query-keys";
import { OrderServices } from "@/services/order.services";

export const dynamic = "force-dynamic";

type CustomerOrdersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const CustomerOrdersPage = async ({ searchParams }: CustomerOrdersPageProps) => {
  const resolvedSearchParams = await searchParams;
  const queryString = buildQueryString(resolvedSearchParams);
  const filters = getOrderFiltersFromSearchParams(new URLSearchParams(queryString));

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.customerOrders(queryString),
    queryFn: () => OrderServices.getCustomerOrders(filters),
    staleTime: 1000 * 60 * 3,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CustomerOrdersPageClient />
    </HydrationBoundary>
  );
};

export default CustomerOrdersPage;
