import { getApiErrorMessage } from "@/lib/api-error";

export const getActionErrorMessage = (
  error: unknown,
  fallbackMessage: string
): string => {
  return getApiErrorMessage(error, fallbackMessage);
};
