import httpClient from "@/lib/axios/httpClient";

export type TChatMessage = {
  role: "user" | "model";
  parts: string;
};

export type TChatResponse = {
  reply: string;
};

const sendMessage = async (
  message: string,
  history: TChatMessage[]
): Promise<TChatResponse> => {
  // httpClient.post<T> returns Promise<ApiResponse<T>>
  // ApiResponse<T> = { success, message, data: T, meta? }
  // So res.data is TChatResponse = { reply: string }
  const res = await httpClient.post<TChatResponse, { message: string; history: TChatMessage[] }>(
    "/chat/message",
    { message, history }
  );
  return res.data as TChatResponse;
};

export const ChatServices = {
  sendMessage,
};
