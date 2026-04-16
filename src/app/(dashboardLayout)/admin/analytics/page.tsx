import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import AdminAnalyticsPageClient from "@/components/modules/Admin/AdminAnalyticsPageClient";
import { queryKeys } from "@/lib/query/query-keys";
import { AdminServices } from "@/services/admin.services";

export const dynamic = "force-dynamic";

const AdminAnalyticsPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.adminAnalytics(30),
    queryFn: () => AdminServices.getAdminAnalyticsOverview(30),
    staleTime: 1000 * 60 * 2,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminAnalyticsPageClient />
    </HydrationBoundary>
  );
};

export default AdminAnalyticsPage;
