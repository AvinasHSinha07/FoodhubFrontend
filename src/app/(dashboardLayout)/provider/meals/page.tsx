import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import ProviderMealsPageClient from "@/components/modules/Provider/ProviderMealsPageClient";
import { queryKeys } from "@/lib/query/query-keys";
import { MealServices } from "@/services/meal.services";
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

const ProviderMealsPage = async () => {
  const queryClient = new QueryClient();

  const profile = await queryClient.fetchQuery({
    queryKey: queryKeys.myProviderProfile(),
    queryFn: () => getProviderProfileSafely(),
    staleTime: 1000 * 60 * 5,
  });

  const providerId = profile?.data?.id;

  if (providerId) {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.providerMeals(providerId),
      queryFn: () => MealServices.getAllMeals({ providerId }),
      staleTime: 1000 * 60 * 3,
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProviderMealsPageClient />
    </HydrationBoundary>
  );
};

export default ProviderMealsPage;
