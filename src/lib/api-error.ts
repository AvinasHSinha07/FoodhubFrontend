import { AxiosError } from "axios";

type TApiErrorSource = {
  path?: string | number;
  message?: string;
};

type TApiErrorBody = {
  message?: string;
  errorSources?: TApiErrorSource[];
  errors?: TApiErrorSource[];
};

const pickFirstErrorSourceMessage = (sources?: TApiErrorSource[]) => {
  if (!Array.isArray(sources) || sources.length === 0) {
    return undefined;
  }

  const first = sources.find((entry) => typeof entry?.message === "string" && entry.message.trim().length > 0);
  return first?.message?.trim();
};

export const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof AxiosError) {
    const payload = error.response?.data as TApiErrorBody | undefined;
    const directMessage = typeof payload?.message === "string" ? payload.message.trim() : "";
    if (directMessage) {
      return directMessage;
    }

    const fromErrorSources = pickFirstErrorSourceMessage(payload?.errorSources);
    if (fromErrorSources) {
      return fromErrorSources;
    }

    const fromLegacyErrors = pickFirstErrorSourceMessage(payload?.errors);
    if (fromLegacyErrors) {
      return fromLegacyErrors;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallbackMessage;
};
