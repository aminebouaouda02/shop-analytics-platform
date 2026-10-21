"use client";

import { useRouter } from "next/navigation";
import { logout } from "../../../lib/auth";
import { getToken } from "../../../lib/token";

/**
 * Simple protected page: only reachable with a stored JWT.
 * Shows the username carried inside the token payload.
 */
function usernameFromToken(): string {
  const token = getToken();
  if (!token) {
    return "unknown";
  }
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as { sub?: string };
    return payload.sub ?? "unknown";
  } catch {
    return "unknown";
  }
}

export default function DashboardPage() {
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div style={{ maxWidth: "40rem", margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Dashboard</h1>
      <p>
        Signed in as <strong>{usernameFromToken()}</strong>.
      </p>
      <p>
        This page is protected: the route group layout only renders it when a
        valid JWT is stored in the browser. Product and order pages will live
        here too in the next steps.
      </p>
      <button onClick={handleLogout} style={{ padding: "0.5rem 1rem" }}>
        Logout
      </button>
    </div>
  );
}
