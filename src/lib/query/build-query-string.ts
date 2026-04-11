export const buildQueryString = (
  params: Record<string, string | string[] | undefined>
): string => {
  return new URLSearchParams(
    Object.entries(params).flatMap(([key, value]) => {
      if (value === undefined) {
        return [];
      }

      return Array.isArray(value)
        ? value.map((singleValue) => [key, singleValue] as [string, string])
        : [[key, value] as [string, string]];
    })
  ).toString();
};
