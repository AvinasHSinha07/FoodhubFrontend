import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import AdminCouponsPageClient from "@/components/modules/Admin/AdminCouponsPageClient";
import { queryKeys } from "@/lib/query/query-keys";
import { AdminServices } from "@/services/admin.services";

export const dynamic = "force-dynamic";

const AdminCouponsPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.adminCoupons(""),
    queryFn: () => AdminServices.getCoupons({ page: 1, limit: 30, sortBy: "createdAt", sortOrder: "desc" }),
    staleTime: 1000 * 60,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminCouponsPageClient />
    </HydrationBoundary>
  );
};

export default AdminCouponsPage;
