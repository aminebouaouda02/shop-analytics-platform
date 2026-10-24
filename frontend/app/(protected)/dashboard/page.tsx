"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiGet } from "../../../lib/api";
import { logout } from "../../../lib/auth";
import { getToken } from "../../../lib/token";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stockQuantity: number;
}

interface Order {
  id: number;
  product: { id: number; name: string };
  quantity: number;
  totalPrice: number;
  customerEmail: string;
  status: string;
}

/**
 * Protected page: only reachable with a stored JWT.
 * Shows the username carried inside the token payload, plus live
 * numbers computed from the products and orders APIs.
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
  const [username] = useState<string>(() => usernameFromToken());
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [productData, orderData] = await Promise.all([
        apiGet<Product[]>("/api/products"),
        apiGet<Order[]>("/api/orders"),
      ]);
      setProducts(productData);
      setOrders(orderData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.totalPrice),
    0
  );
  const lowStock = products.filter((p) => p.stockQuantity < 10).length;

  const stats = [
    { icon: "📦", label: "Total products", value: String(products.length) },
    { icon: "🧾", label: "Total orders", value: String(orders.length) },
    {
      icon: "💰",
      label: "Total revenue",
      value: `${totalRevenue.toFixed(2)} MAD`,
    },
    { icon: "⚠️", label: "Low stock (< 10)", value: String(lowStock) },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {username} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            You are signed in. Here is a live overview of your shop, computed
            from the products and orders APIs.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-600 ring-1 ring-red-200 transition hover:bg-red-50"
        >
          Logout
        </button>
      </div>

      {loading ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" aria-label="Loading statistics">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="animate-pulse rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70"
            >
              <div className="h-8 w-8 rounded bg-slate-200" />
              <div className="mt-4 h-7 w-1/2 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl bg-red-50 p-6 text-center ring-1 ring-red-200">
          <p className="font-semibold text-red-800">Could not load the statistics.</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70"
            >
              <span className="text-3xl" aria-hidden>
                {stat.icon}
              </span>
              <p className="mt-3 text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </article>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Link
          href="/products"
          className="group rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 p-6 text-white shadow-card transition hover:opacity-95"
        >
          <span className="text-3xl" aria-hidden>
            🛍️
          </span>
          <h2 className="mt-3 text-lg font-semibold">Product catalogue</h2>
          <p className="mt-1 text-sm text-brand-50">
            Search, filter, add, edit and delete products.
          </p>
          <span className="mt-3 inline-block text-sm font-semibold">
            Go to products →
          </span>
        </Link>
        <Link
          href="/orders"
          className="group rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70 transition hover:ring-brand-200"
        >
          <span className="text-3xl" aria-hidden>
            🧾
          </span>
          <h2 className="mt-3 text-lg font-semibold text-slate-900">Orders</h2>
          <p className="mt-1 text-sm text-slate-600">
            Review customer orders, their totals and their statuses.
          </p>
          <span className="mt-3 inline-block text-sm font-semibold text-brand-700">
            Go to orders →
          </span>
        </Link>
      </div>
    </div>
  );
}
