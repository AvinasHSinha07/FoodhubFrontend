import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import CustomerOrdersPageClient from "@/components/modules/Customer/CustomerOrdersPageClient";
import { queryKeys } from "@/lib/query/query-keys";
import { OrderServices } from "@/services/order.services";

export const dynamic = "force-dynamic";

const CustomerOrdersPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.customerOrders(),
    queryFn: () => OrderServices.getCustomerOrders(),
    staleTime: 1000 * 60 * 3,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CustomerOrdersPageClient />
    </HydrationBoundary>
  );
};

export default CustomerOrdersPage;
