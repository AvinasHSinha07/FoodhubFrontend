import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import ProviderAnalyticsPageClient from "@/components/modules/Provider/ProviderAnalyticsPageClient";
import { queryKeys } from "@/lib/query/query-keys";
import { AnalyticsServices } from "@/services/analytics.services";

export const dynamic = "force-dynamic";

const ProviderAnalyticsPage = async () => {
  const queryClient = new QueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.providerAnalytics(30),
      queryFn: () => AnalyticsServices.getProviderAnalyticsOverview(30),
      staleTime: 1000 * 60 * 2,
    });
  } catch {
    // Render client fallback for providers without profiles/orders.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProviderAnalyticsPageClient />
    </HydrationBoundary>
  );
};

export default ProviderAnalyticsPage;
