import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import MealDetailsPageClient from "@/components/modules/Meal/MealDetailsPageClient";
import { queryKeys } from "@/lib/query/query-keys";
import { MealServices } from "@/services/meal.services";
import { ReviewServices } from "@/services/review.services";

type MealDetailsPageProps = {
  params: Promise<{ id: string }>;
};

const MealDetailsPage = async ({ params }: MealDetailsPageProps) => {
  const { id } = await params;

  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.meal(id),
      queryFn: () => MealServices.getMealById(id),
      staleTime: 1000 * 60 * 10,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.mealReviews(id),
      queryFn: () => ReviewServices.getMealReviews(id),
      staleTime: 1000 * 60 * 5,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MealDetailsPageClient mealId={id} />
    </HydrationBoundary>
  );
};

export default MealDetailsPage;
