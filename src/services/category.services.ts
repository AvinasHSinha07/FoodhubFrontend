import httpClient from "../lib/axios/httpClient";
import { IResponse } from "../types/api.types";
import { ICategory } from "../types/category.types";

export interface ICreateCategoryPayload {
  name: string;
}

const getCategories = async (): Promise<IResponse<ICategory[]>> => {
  const result = await httpClient.get("/categories");
  return result.data;
};

const createCategory = async (
  data: ICreateCategoryPayload
): Promise<IResponse<ICategory>> => {
  const result = await httpClient.post("/admin/categories", data);
  return result.data;
};

const deleteCategory = async (id: string): Promise<IResponse<null>> => {
  const result = await httpClient.delete(`/admin/categories/${id}`);
  return result.data;
};

export const CategoryServices = {
  getCategories,
  createCategory,
  deleteCategory,
};
