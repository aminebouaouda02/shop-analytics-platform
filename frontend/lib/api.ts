/**
 * Small API helper for the Spring Boot backend.
 * Sends the stored JWT as an Authorization header on every request
 * (public endpoints simply ignore it).
 */

import { getToken } from "./token";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: authHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${path}`);
  }

  return (await response.json()) as T;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let detail = "";
    try {
      const data = (await response.json()) as { error?: string };
      if (data.error) {
        detail = ` — ${data.error}`;
      }
    } catch {
      // ignore: not a JSON error body
    }
    throw new Error(`API request failed: ${response.status} ${path}${detail}`);
  }

  return (await response.json()) as T;
}

export async function checkHealth(): Promise<HealthResponse> {
  return apiGet<HealthResponse>("/api/health");
}

export { API_BASE_URL };
