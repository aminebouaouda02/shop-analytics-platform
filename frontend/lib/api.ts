/**
 * Small API helper for the Spring Boot backend.
 * Day 1 only includes the health check and a generic GET helper.
 * Product / order calls will be added with their modules.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${path}`);
  }

  return (await response.json()) as T;
}

export async function checkHealth(): Promise<HealthResponse> {
  return apiGet<HealthResponse>("/api/health");
}

export { API_BASE_URL };
