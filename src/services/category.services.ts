import httpClient from "../lib/axios/httpClient";
import { IResponse } from "../types/api.types";
import { ICategory } from "../types/category.types";

export interface ICreateCategoryPayload {
  name: string;
}

const getCategories = async (): Promise<IResponse<ICategory[]>> => {
  return httpClient.get<ICategory[]>("/categories");
};

const createCategory = async (
  data: ICreateCategoryPayload
): Promise<IResponse<ICategory>> => {
  return httpClient.post<ICategory, ICreateCategoryPayload>("/admin/categories", data);
};

const deleteCategory = async (id: string): Promise<IResponse<null>> => {
  return httpClient.delete<null>(`/admin/categories/${id}`);
};

export const CategoryServices = {
  getCategories,
  createCategory,
  deleteCategory,
};
