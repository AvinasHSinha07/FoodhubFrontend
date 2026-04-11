import httpClient from "../lib/axios/httpClient";
import { IResponse } from "../types/api.types";

const uploadImage = async (file: File): Promise<IResponse<{ url: string; publicId: string }>> => {
  const formData = new FormData();
  formData.append("file", file);

  return httpClient.post<{ url: string; publicId: string }, FormData>(
    "/upload/image",
    formData,
    undefined,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

const deleteImage = async (publicId: string): Promise<IResponse<any>> => {
  return httpClient.delete<any>(`/upload/image/${publicId}`);
};

export const UploadServices = {
  uploadImage,
  deleteImage,
};