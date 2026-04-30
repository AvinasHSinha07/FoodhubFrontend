import httpClient from "@/lib/axios/httpClient";

export type TSearchSuggestionsResponse = {
  suggestions: string[];
};

const getSuggestions = async (query: string): Promise<string[]> => {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await httpClient.get<TSearchSuggestionsResponse>(
      `/search/suggestions?q=${encodeURIComponent(query.trim())}`
    );
    return (res.data as TSearchSuggestionsResponse)?.suggestions ?? [];
  } catch {
    return [];
  }
};

export const SearchServices = {
  getSuggestions,
};
