type AdminUsersFilter = {
  role?: string;
  status?: string;
  searchTerm?: string;
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

export const getAdminUsersFiltersFromSearchParams = (
  searchParams: URLSearchParams
): AdminUsersFilter => {
  const role = searchParams.get("role") || undefined;
  const status = searchParams.get("status") || undefined;
  const searchTerm = searchParams.get("search") || undefined;
  const page = toOptionalNumber(searchParams.get("page"));
  const limit = toOptionalNumber(searchParams.get("limit"));
  const sortBy = searchParams.get("sortBy") || undefined;
  const sortOrder =
    searchParams.get("sortOrder") === "asc" || searchParams.get("sortOrder") === "desc"
      ? (searchParams.get("sortOrder") as "asc" | "desc")
      : undefined;

  return {
    role,
    status,
    searchTerm,
    page,
    limit,
    sortBy,
    sortOrder,
  };
};
