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

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
}

interface CurrentUserResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

function mapCurrentUser(user: CurrentUserResponse): User {
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
  };
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
  const { data: tokenData } = await apiClient.post<TokenResponse>("/auth/login", {
    email: payload.email,
    password: payload.password,
  });
  setTokens(tokenData.access_token, tokenData.refresh_token);
  const { data: userData } = await apiClient.get<CurrentUserResponse>("/auth/me");
  const response: AuthResponse = {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    user: mapCurrentUser(userData),
  };
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
  return response;
}

export async function signUp(_payload: SignUpPayload): Promise<AuthResponse> {
  if (USE_MOCK) {
    await delay(500);
    const response: AuthResponse = {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: { ...mockUser, ..._payload, id: "new-user" },
    };
    setTokens(response.accessToken, response.refreshToken);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
    return response;
  }
  throw new Error("Signup endpoint is not defined in current OpenAPI.");
}

export async function resetPassword(email: string): Promise<void> {
  if (USE_MOCK) {
    await delay(500);
    return;
  }
  await apiClient.post("/auth/forgot-password", { email });
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
