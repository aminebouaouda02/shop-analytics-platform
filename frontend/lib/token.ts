/**
 * Tiny wrapper around localStorage for the JWT auth token.
 * Kept in its own module so api.ts and auth.ts can both use it
 * without a circular import.
 */

const TOKEN_KEY = "shop_auth_token";

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  return getToken() !== null;
}
