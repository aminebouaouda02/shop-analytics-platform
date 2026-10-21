/**
 * Auth actions for the login / register pages.
 * On success the JWT is stored in localStorage via token.ts.
 */

import { apiPost } from "./api";
import { clearToken, setToken } from "./token";

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
}

export async function register(
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await apiPost<AuthResponse>("/api/auth/register", {
    username,
    email,
    password,
  });
  setToken(response.token);
  return response;
}

export async function login(
  username: string,
  password: string
): Promise<AuthResponse> {
  const response = await apiPost<AuthResponse>("/api/auth/login", {
    username,
    password,
  });
  setToken(response.token);
  return response;
}

export function logout(): void {
  clearToken();
}
