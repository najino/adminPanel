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
  // Let the browser/axios set multipart boundary — do not keep application/json
  if (typeof FormData !== "undefined" && config.data instanceof FormData && config.headers) {
    if (typeof config.headers.delete === "function") {
      config.headers.delete("Content-Type");
    } else {
      delete (config.headers as Record<string, unknown>)["Content-Type"];
    }
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

    const data = error.response?.data as unknown;
    let message = "";
    let code: string | undefined;
    const detailParts: string[] = [];

    if (data && typeof data === "object") {
      const root = data as Record<string, unknown>;
      const body =
        root.error && typeof root.error === "object"
          ? (root.error as Record<string, unknown>)
          : root;

      if (body.message != null) message = String(body.message);
      if (body.code != null) code = String(body.code);

      if (body.details && typeof body.details === "object" && !Array.isArray(body.details)) {
        for (const [field, value] of Object.entries(body.details as Record<string, unknown>)) {
          if (value != null && value !== "") detailParts.push(`${field}: ${String(value)}`);
        }
      }
    }

    if (!message) message = error.message || "An unexpected error occurred";
    if (detailParts.length > 0) {
      message = `${message} (${detailParts.join(", ")})`;
    }
    if (code && !message.includes(code)) {
      // keep code on the error object via data; message stays human-readable
    }

    throw new ApiError(message, error.response?.status, error.response?.data);
  },
);
