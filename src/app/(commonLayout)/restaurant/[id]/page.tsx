import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import RestaurantMenuPageClient from "@/components/modules/Restaurant/RestaurantMenuPageClient";
import { queryKeys } from "@/lib/query/query-keys";
import { ProviderProfileServices } from "@/services/providerProfile.services";

type RestaurantMenuPageProps = {
  params: Promise<{ id: string }>;
};

const RestaurantMenuPage = async ({ params }: RestaurantMenuPageProps) => {
  const { id } = await params;

  const queryClient = new QueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.provider(id),
      queryFn: () => ProviderProfileServices.getProviderById(id),
      staleTime: 1000 * 60 * 10,
    });
  } catch {
    // Render fallback UI in client when provider does not exist.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RestaurantMenuPageClient providerId={id} />
    </HydrationBoundary>
  );
};

export default RestaurantMenuPage;
