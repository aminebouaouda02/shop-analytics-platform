"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiDelete, apiGet, apiPut } from "../../../../lib/api";

/** Order shape as returned by GET /api/orders/{id}. */
interface Order {
  id: number;
  product: { id: number; name: string; price?: number };
  quantity: number;
  totalPrice: number;
  customerEmail: string;
  status: string;
  createdAt?: string;
}

const STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "CANCELLED"] as const;

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusDraft, setStatusDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet<Order>(`/api/orders/${id}`);
      setOrder(data);
      setStatusDraft(data.status);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load this order.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleStatusSave() {
    setSaving(true);
    setActionError("");
    try {
      const updated = await apiPut<Order>(
        `/api/orders/${id}/status?status=${encodeURIComponent(statusDraft)}`,
        {},
      );
      setOrder(updated);
      setStatusDraft(updated.status);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not update the status.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await apiDelete(`/api/orders/${id}`);
      router.push("/orders");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not delete this order.",
      );
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="animate-pulse text-sm text-slate-500">Loading order…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {error || "Order not found."}
        </p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Try again
          </button>
          <Link
            href="/orders"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/orders"
        className="text-sm font-semibold text-brand-700 hover:underline"
      >
        ← Back to orders
      </Link>
      <h1 className="mt-3 text-3xl font-bold text-slate-900">
        Order #{order.id}
      </h1>
      <dl className="mt-6 space-y-3 rounded-2xl bg-white p-6 text-sm shadow-card ring-1 ring-slate-200/70">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Product</dt>
          <dd className="font-semibold text-slate-900">
            <Link
              href={`/products/${order.product.id}`}
              className="text-brand-700 hover:underline"
            >
              {order.product.name}
            </Link>
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Quantity</dt>
          <dd className="font-semibold text-slate-900">× {order.quantity}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Total</dt>
          <dd className="font-semibold text-slate-900">
            {Number(order.totalPrice).toFixed(2)} MAD
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Customer</dt>
          <dd className="font-semibold text-slate-900">
            {order.customerEmail}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Status</dt>
          <dd className="font-semibold text-slate-900">{order.status}</dd>
        </div>
      </dl>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70">
        <h2 className="font-semibold text-slate-900">Change status</h2>
        {actionError && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
            {actionError}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select
            value={statusDraft}
            onChange={(e) => setStatusDraft(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            aria-label="New status for this order"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={saving || statusDraft === order.status}
            onClick={() => void handleStatusSave()}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save status"}
          </button>
        </div>
      </section>

      <div className="mt-6 flex gap-3">
        {confirmingDelete ? (
          <>
            <button
              type="button"
              disabled={deleting}
              onClick={() => void handleDelete()}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {deleting ? "Deleting…" : "Confirm delete"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            Delete order
          </button>
        )}
      </div>
    </div>
  );
}
