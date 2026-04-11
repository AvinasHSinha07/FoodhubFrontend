import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import AdminCategoriesPageClient from "@/components/modules/Admin/AdminCategoriesPageClient";
import { queryKeys } from "@/lib/query/query-keys";
import { CategoryServices } from "@/services/category.services";

export const dynamic = "force-dynamic";

const AdminCategoriesPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.categories(),
    queryFn: () => CategoryServices.getCategories(),
    staleTime: 1000 * 60 * 60,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminCategoriesPageClient />
    </HydrationBoundary>
  );
};

export default AdminCategoriesPage;
