type AdminUsersFilter = {
  role?: string;
  status?: string;
  searchTerm?: string;
};

export const getAdminUsersFiltersFromSearchParams = (
  searchParams: URLSearchParams
): AdminUsersFilter => {
  const role = searchParams.get("role") || undefined;
  const status = searchParams.get("status") || undefined;
  const searchTerm = searchParams.get("search") || undefined;

  return {
    role,
    status,
    searchTerm,
  };
};
