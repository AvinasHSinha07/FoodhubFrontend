type OrderListFilters = {
  orderStatus?: string;
  paymentStatus?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

const toOptionalNumber = (value: string | null): number | undefined => {
  if (!value) {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? undefined : parsedValue;
};

export const getOrderFiltersFromSearchParams = (
  searchParams: URLSearchParams
): OrderListFilters => {
  return {
    orderStatus: searchParams.get("orderStatus") || undefined,
    paymentStatus: searchParams.get("paymentStatus") || undefined,
    page: toOptionalNumber(searchParams.get("page")),
    limit: toOptionalNumber(searchParams.get("limit")),
    sortBy: searchParams.get("sortBy") || undefined,
    sortOrder:
      searchParams.get("sortOrder") === "asc" || searchParams.get("sortOrder") === "desc"
        ? (searchParams.get("sortOrder") as "asc" | "desc")
        : undefined,
  };
};