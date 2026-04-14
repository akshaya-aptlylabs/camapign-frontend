import axios, { AxiosResponse } from "axios";
import {
  Campaign,
  User,
  CampaignStats,
  ApiResponse,
  PaginatedApiResponse,
  CampaignEvent,
  MessageQueryParams,
  CampaignQueryParams,
  CreateCampaignPayload,
  UpdateCampaignPayload,
  CreateMessageBody,
  UpdateMessageBody,
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

export interface EventQueryParams {
  campaignId?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export interface CreateEventPayload {
  type: string;
  name: string;
  description?: string;
  metadata?: Record<string, unknown>;
  occurredAt?: string;
  campaignId: string;
}

export const eventApi = {
  getAll: (
    params: EventQueryParams = {},
  ): Promise<PaginatedApiResponse<CampaignEvent>> =>
    api.get("/events", { params }),

  getByCampaign: (
    campaignId: string,
    params: EventQueryParams = {},
  ): Promise<PaginatedApiResponse<CampaignEvent>> =>
    api.get(`/campaigns/${campaignId}/events`, { params }),

  getById: (id: string): Promise<ApiResponse<CampaignEvent>> =>
    api.get(`/events/${id}`),

  create: (data: CreateEventPayload): Promise<ApiResponse<CampaignEvent>> =>
    api.post("/events", data),

  delete: (id: string): Promise<ApiResponse<null>> =>
    api.delete(`/events/${id}`),
};

export const messageApi = {
  getAll: (params?: MessageQueryParams) => api.get("/messages", { params }),

  getByCampaign: (campaignId: string, params?: MessageQueryParams) =>
    api.get(`/campaigns/${campaignId}/messages`, { params }),

  getByEvent: (eventId: string, params?: MessageQueryParams) =>
    api.get(`/events/${eventId}/messages`, { params }),

  getById: (id: string) => api.get(`/messages/${id}`),

  create: (data: CreateMessageBody) => api.post("/messages", data),

  update: (id: string, data: UpdateMessageBody) =>
    api.patch(`/messages/${id}`, data),

  delete: (id: string) => api.delete(`/messages/${id}`),
};

export interface HealthResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export const healthApi = {
  check: (): Promise<HealthResponse> => api.get("/health"),
};

export default api;
