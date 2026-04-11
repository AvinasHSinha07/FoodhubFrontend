import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import MealsPageClient from "@/components/modules/Meal/MealsPageClient";
import { buildQueryString } from "@/lib/query/build-query-string";
import { getMealFiltersFromSearchParams } from "@/lib/query/meal-filters";
import { queryKeys } from "@/lib/query/query-keys";
import { CategoryServices } from "@/services/category.services";
import { MealServices } from "@/services/meal.services";

type MealsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const MealsPage = async ({ searchParams }: MealsPageProps) => {
  const resolvedSearchParams = await searchParams;
  const queryString = buildQueryString(resolvedSearchParams);

  const queryClient = new QueryClient();
  const filters = getMealFiltersFromSearchParams(new URLSearchParams(queryString));

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.meals(queryString),
      queryFn: () => MealServices.getAllMeals(filters),
      staleTime: 1000 * 60 * 10,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.categories(),
      queryFn: () => CategoryServices.getCategories(),
      staleTime: 1000 * 60 * 60,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MealsPageClient />
    </HydrationBoundary>
  );
};

export default MealsPage;
