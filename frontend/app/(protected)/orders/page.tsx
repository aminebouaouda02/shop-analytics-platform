"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPost } from "../../../lib/api";

/** Order shape as returned by GET /api/orders. */
interface Order {
  id: number;
  product: { id: number; name: string; price?: number };
  quantity: number;
  totalPrice: number;
  customerEmail: string;
  status: string;
}

/** Product shape as returned by GET /api/products (for the order form). */
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stockQuantity: number;
}

/**
 * Payload of POST /api/orders (OrderRequest DTO): productId, quantity,
 * customerEmail. There is deliberately no status field: the backend
 * creates every order as PENDING and computes the total price itself.
 */
interface OrderPayload {
  productId: number;
  quantity: number;
  customerEmail: string;
}

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200";
const labelCls = "block text-sm font-medium text-slate-700";

function statusBadgeCls(status: string): string {
  switch (status.toUpperCase()) {
    case "PENDING":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "SHIPPED":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [customerEmail, setCustomerEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const load = useCallback(async (withSkeleton = false) => {
    if (withSkeleton) {
      setLoading(true);
    }
    setError("");
    try {
      const [orderData, productData] = await Promise.all([
        apiGet<Order[]>("/api/orders"),
        apiGet<Product[]>("/api/products"),
      ]);
      setOrders(orderData);
      setProducts(productData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(true);
  }, [load]);

  const selectedProduct = products.find((p) => String(p.id) === productId);
  const estimatedTotal =
    selectedProduct && Number(quantity) > 0
      ? Number(selectedProduct.price) * Number(quantity)
      : null;

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreateError("");
    if (!productId) {
      setCreateError("Choose a product first.");
      return;
    }
    const payload: OrderPayload = {
      productId: Number(productId),
      quantity: Number.parseInt(quantity, 10),
      customerEmail: customerEmail.trim(),
    };
    setCreating(true);
    try {
      await apiPost<Order>("/api/orders", payload);
      setProductId("");
      setQuantity("1");
      setCustomerEmail("");
      setShowCreate(false);
      await load();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Could not create the order.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
          <p className="mt-1 text-sm text-slate-500">
            Orders placed by customers. Totals are computed by the server from
            the current product price.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          {showCreate ? "Close form" : "+ New order"}
        </button>
      </div>

      {showCreate && (
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">New order</h2>
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls} htmlFor="order-product">
                Product *
              </label>
              <select
                id="order-product"
                className={inputCls}
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
              >
                <option value="">Choose a product…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {Number(p.price).toFixed(2)} MAD
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="order-quantity">
                Quantity *
              </label>
              <input
                id="order-quantity"
                className={inputCls}
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="order-email">
                Customer email *
              </label>
              <input
                id="order-email"
                className={inputCls}
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
                placeholder="customer@example.com"
              />
            </div>
            {estimatedTotal !== null && (
              <p className="text-sm text-slate-500 sm:col-span-3">
                Estimated total:{" "}
                <strong className="text-slate-700">
                  {estimatedTotal.toFixed(2)} MAD
                </strong>{" "}
                (the server computes the final total when the order is created;
                new orders start as PENDING)
              </p>
            )}
            {createError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200 sm:col-span-3">
                {createError}
              </p>
            )}
            <div className="flex gap-2 sm:col-span-3">
              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
              >
                {creating ? "Creating…" : "Create order"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {loading ? (
        <div
          className="mt-6 animate-pulse rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70"
          aria-label="Loading orders"
        >
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex items-center gap-4 border-b border-slate-100 py-4 last:border-0">
              <div className="h-4 w-16 rounded bg-slate-200" />
              <div className="h-4 w-1/3 rounded bg-slate-200" />
              <div className="h-4 w-20 rounded bg-slate-100" />
              <div className="ml-auto h-4 w-24 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl bg-red-50 p-6 text-center ring-1 ring-red-200">
          <p className="font-semibold text-red-800">Could not load the orders.</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => void load(true)}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-card ring-1 ring-slate-200/70">
          <p className="text-4xl" aria-hidden>
            🧾
          </p>
          <h2 className="mt-3 text-lg font-semibold text-slate-900">No orders yet</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            When a customer orders a product, the order will appear here with
            its server-computed total.
          </p>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="mt-5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            + New order
          </button>
        </div>
      ) : (
        <section className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-card ring-1 ring-slate-200/70">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-semibold">Order</th>
                <th className="px-5 py-3 font-semibold">Product</th>
                <th className="px-5 py-3 font-semibold">Qty</th>
                <th className="px-5 py-3 font-semibold">Total</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-brand-50/40"
                >
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    #{order.id}
                  </td>
                  <td className="px-5 py-4 text-slate-700">{order.product.name}</td>
                  <td className="px-5 py-4 text-slate-700">× {order.quantity}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {Number(order.totalPrice).toFixed(2)} MAD
                  </td>
                  <td className="px-5 py-4 text-slate-500">{order.customerEmail}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusBadgeCls(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
