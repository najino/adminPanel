import { apiClient, setTokens, clearTokens } from "@/api/client";
import { AUTH_USER_KEY } from "@/constants";
import { IS_MOCK_MODE } from "@/config/mock";
import { mockUser } from "@/lib/mock-data";
import type { AuthResponse, User } from "@/types";

const USE_MOCK = IS_MOCK_MODE;

export interface SignInPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export async function signIn(payload: SignInPayload): Promise<AuthResponse> {
  if (USE_MOCK) {
    await delay(500);
    const response: AuthResponse = {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: {
        ...mockUser,
        email: payload.email,
        firstName: payload.email.split("@")[0] || mockUser.firstName,
      },
    };
    setTokens(response.accessToken, response.refreshToken);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
    return response;
  }
  const { data } = await apiClient.post<AuthResponse>("/auth/signin", payload);
  setTokens(data.accessToken, data.refreshToken);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
  return data;
}

export async function signUp(payload: SignUpPayload): Promise<AuthResponse> {
  if (USE_MOCK) {
    await delay(500);
    const response: AuthResponse = {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: { ...mockUser, ...payload, id: "new-user" },
    };
    setTokens(response.accessToken, response.refreshToken);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
    return response;
  }
  const { data } = await apiClient.post<AuthResponse>("/auth/signup", payload);
  setTokens(data.accessToken, data.refreshToken);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
  return data;
}

export async function resetPassword(email: string): Promise<void> {
  if (USE_MOCK) {
    await delay(500);
    return;
  }
  await apiClient.post("/auth/reset-password", { email });
}

export async function signOut(): Promise<void> {
  if (!USE_MOCK) {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // ignore logout errors
    }
  }
  clearTokens();
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
