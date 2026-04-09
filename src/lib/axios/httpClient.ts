import axios from "axios";
import { getCookie } from "cookies-next";

export const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default httpClient;