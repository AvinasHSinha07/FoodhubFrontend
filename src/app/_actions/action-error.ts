import { AxiosError } from "axios";

export const getActionErrorMessage = (
  error: unknown,
  fallbackMessage: string
): string => {
  if (error instanceof AxiosError) {
    const serverMessage = error.response?.data?.message;
    if (typeof serverMessage === "string" && serverMessage.trim().length > 0) {
      return serverMessage;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallbackMessage;
};
