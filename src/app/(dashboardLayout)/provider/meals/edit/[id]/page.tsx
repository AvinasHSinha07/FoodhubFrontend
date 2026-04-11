import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import ProviderEditMealPageClient from "@/components/modules/Provider/ProviderEditMealPageClient";
import { queryKeys } from "@/lib/query/query-keys";
import { MealServices } from "@/services/meal.services";

export const dynamic = "force-dynamic";

type ProviderEditMealPageProps = {
  params: Promise<{ id: string }>;
};

const ProviderEditMealPage = async ({ params }: ProviderEditMealPageProps) => {
  const { id } = await params;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.meal(id),
    queryFn: () => MealServices.getMealById(id),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProviderEditMealPageClient mealId={id} />
    </HydrationBoundary>
  );
};

export default ProviderEditMealPage;
