"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../lib/token";

/**
 * Layout for the protected route group `(protected)`.
 * Any page inside this group (e.g. /dashboard) is only reachable
 * when a JWT is stored; otherwise the user is sent back to /login.
 * The URL stays clean because the route group name is hidden.
 */
export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      setAllowed(true);
    } else {
      router.replace("/login");
    }
  }, [router]);

  if (!allowed) {
    return <p style={{ padding: "2rem" }}>Checking your session…</p>;
  }

  return <>{children}</>;
}
