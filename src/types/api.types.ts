export interface IMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  totalPage?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  meta?: IMeta;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: unknown;
}

export type IResponse<T> = ApiResponse<T>;
