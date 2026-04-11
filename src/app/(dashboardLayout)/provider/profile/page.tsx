import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import ProviderProfilePageClient from "@/components/modules/Provider/ProviderProfilePageClient";
import { queryKeys } from "@/lib/query/query-keys";
import { ProviderProfileServices } from "@/services/providerProfile.services";

export const dynamic = "force-dynamic";

const getProviderProfileSafely = async () => {
  try {
    return await ProviderProfileServices.getMyProfile();
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }

    throw error;
  }
};

const ProviderProfilePage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.myProviderProfile(),
    queryFn: () => getProviderProfileSafely(),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProviderProfilePageClient />
    </HydrationBoundary>
  );
};

export default ProviderProfilePage;
