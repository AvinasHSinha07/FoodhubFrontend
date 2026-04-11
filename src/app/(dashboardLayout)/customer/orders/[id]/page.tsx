import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import CustomerOrderDetailsPageClient from "@/components/modules/Customer/CustomerOrderDetailsPageClient";
import { queryKeys } from "@/lib/query/query-keys";
import { OrderServices } from "@/services/order.services";

export const dynamic = "force-dynamic";

type CustomerOrderDetailsPageProps = {
  params: Promise<{ id: string }>;
};

const CustomerOrderDetailsPage = async ({ params }: CustomerOrderDetailsPageProps) => {
  const { id } = await params;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.order(id),
    queryFn: () => OrderServices.getOrderById(id),
    staleTime: 1000 * 60 * 3,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CustomerOrderDetailsPageClient orderId={id} />
    </HydrationBoundary>
  );
};

export default CustomerOrderDetailsPage;
