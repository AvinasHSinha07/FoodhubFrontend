import { IMealFilters } from "@/types/meal.types";

const toOptionalNumber = (value: string | null): number | undefined => {
  if (!value) {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? undefined : parsedValue;
};

export const getMealFiltersFromSearchParams = (
  searchParams: URLSearchParams
): IMealFilters => {
  return {
    searchTerm: searchParams.get("search") || undefined,
    categoryId: searchParams.get("categoryId") || undefined,
    minPrice: toOptionalNumber(searchParams.get("minPrice")),
    maxPrice: toOptionalNumber(searchParams.get("maxPrice")),
    dietaryTag: searchParams.get("dietaryTag") || undefined,
    isAvailable: true,
  };
};
