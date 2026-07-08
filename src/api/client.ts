import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const TOKEN_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api",
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/signin";
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<TokenResponse>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken },
        );
        setTokens(data.access_token, data.refresh_token);
        refreshQueue.forEach((cb) => cb(data.access_token));
        refreshQueue = [];
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        }
        return apiClient(originalRequest);
      } catch {
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/signin";
        }
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    const maybeMessage =
      typeof error.response?.data === "object" &&
      error.response?.data !== null &&
      "message" in error.response.data
        ? String((error.response.data as { message?: unknown }).message ?? "")
        : "";

    const message = maybeMessage || error.message || "An unexpected error occurred";
    throw new ApiError(message, error.response?.status, error.response?.data);
  },
);
