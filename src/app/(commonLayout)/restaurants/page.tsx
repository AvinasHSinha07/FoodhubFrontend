import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import RestaurantsPageClient from "@/components/modules/Restaurant/RestaurantsPageClient";
import { buildQueryString } from "@/lib/query/build-query-string";
import { queryKeys } from "@/lib/query/query-keys";
import { ProviderProfileServices } from "@/services/providerProfile.services";

type RestaurantsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const RestaurantsPage = async ({ searchParams }: RestaurantsPageProps) => {
  const resolvedSearchParams = await searchParams;
  const queryString = buildQueryString(resolvedSearchParams);

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.providers(queryString),
    queryFn: () =>
      ProviderProfileServices.getAllProviders({
        searchTerm: resolvedSearchParams.search as string | undefined,
        page: resolvedSearchParams.page ? Number(resolvedSearchParams.page) : 1,
        limit: 9,
        sortBy: (resolvedSearchParams.sortBy as string | undefined) || "createdAt",
        sortOrder: ((resolvedSearchParams.sortOrder as "asc" | "desc" | undefined) || "desc"),
      }),
    staleTime: 1000 * 60 * 10,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RestaurantsPageClient />
    </HydrationBoundary>
  );
};

export default RestaurantsPage;
