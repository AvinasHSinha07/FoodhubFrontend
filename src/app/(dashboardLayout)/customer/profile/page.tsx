import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import CustomerProfilePageClient from "@/components/modules/Customer/CustomerProfilePageClient";
import { queryKeys } from "@/lib/query/query-keys";
import { UserServices } from "@/services/user.services";

export const dynamic = "force-dynamic";

const CustomerProfilePage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.myUserProfile(),
    queryFn: () => UserServices.getMyProfile(),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CustomerProfilePageClient />
    </HydrationBoundary>
  );
};

export default CustomerProfilePage;
