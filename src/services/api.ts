import axios, { AxiosResponse } from "axios";
import {
  Campaign,
  User,
  CampaignStats,
  ApiResponse,
  PaginatedApiResponse,
} from "../types";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || error.message || "An error occurred";
      return Promise.reject(new Error(message));
    }
    return Promise.reject(new Error("An unexpected error occurred"));
  },
);

export interface CampaignQueryParams {
  status?: string;
  triggeredBy?: string;
  tags?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  page?: number;
  limit?: number;
  userId?: string;
}

export interface CreateCampaignPayload {
  name: string;
  description?: string;
  type?: string;
  triggeredBy?: string;
  tags?: string[];
  subject?: string;
  senderName?: string;
  senderEmail?: string;
  totalRecipients?: number;
  scheduledAt?: string;
  userId: string;
}

export interface UpdateCampaignPayload {
  name?: string;
  description?: string;
  type?: string;
  triggeredBy?: string;
  status?: string;
  tags?: string[];
  subject?: string;
  senderName?: string;
  senderEmail?: string;
  totalRecipients?: number;
}

export const campaignApi = {
  getAll: (
    params: CampaignQueryParams = {},
  ): Promise<PaginatedApiResponse<Campaign>> =>
    api.get("/campaigns", { params }),

  getById: (id: string): Promise<ApiResponse<Campaign>> =>
    api.get(`/campaigns/${id}`),

  create: (data: CreateCampaignPayload): Promise<ApiResponse<Campaign>> =>
    api.post("/campaigns", data),

  update: (
    id: string,
    data: UpdateCampaignPayload,
  ): Promise<ApiResponse<Campaign>> => api.put(`/campaigns/${id}`, data),

  delete: (id: string): Promise<ApiResponse<null>> =>
    api.delete(`/campaigns/${id}`),

  getStats: (): Promise<ApiResponse<CampaignStats>> =>
    api.get("/campaigns/stats/summary"),
};

export const userApi = {
  getAll: (): Promise<ApiResponse<User[]>> => api.get("/users"),

  getById: (id: string): Promise<ApiResponse<User>> => api.get(`/users/${id}`),
};

export default api;
