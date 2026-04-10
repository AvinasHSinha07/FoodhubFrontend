import httpClient from "../lib/axios/httpClient";
import { IResponse } from "../types/api.types";

const uploadImage = async (file: File): Promise<IResponse<{ url: string; publicId: string }>> => {
  const formData = new FormData();
  formData.append("file", file);

  const result = await httpClient.post("/upload/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return result.data;
};

const deleteImage = async (publicId: string): Promise<IResponse<any>> => {
  const result = await httpClient.delete(`/upload/image/${publicId}`);
  return result.data;
};

export const UploadServices = {
  uploadImage,
  deleteImage,
};