import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import ProviderOrderDetailsPageClient from "@/components/modules/Provider/ProviderOrderDetailsPageClient";
import { queryKeys } from "@/lib/query/query-keys";
import { OrderServices } from "@/services/order.services";

export const dynamic = "force-dynamic";

type ProviderOrderDetailsPageProps = {
  params: Promise<{ id: string }>;
};

const ProviderOrderDetailsPage = async ({ params }: ProviderOrderDetailsPageProps) => {
  const { id } = await params;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.order(id),
    queryFn: () => OrderServices.getOrderById(id),
    staleTime: 1000 * 60 * 2,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProviderOrderDetailsPageClient orderId={id} />
    </HydrationBoundary>
  );
};

export default ProviderOrderDetailsPage;
