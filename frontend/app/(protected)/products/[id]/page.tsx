"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiDelete, apiGet, apiPut } from "../../../../lib/api";

/** Product shape as returned by GET /api/products/{id}. */
interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  category: string;
  stockQuantity: number;
}

interface ProductFormValues {
  name: string;
  description: string;
  price: string;
  category: string;
  stockQuantity: string;
}

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200";
const labelCls = "block text-sm font-medium text-slate-700";

function productToForm(product: Product): ProductFormValues {
  return {
    name: product.name,
    description: product.description ?? "",
    price: String(product.price),
    category: product.category,
    stockQuantity: String(product.stockQuantity),
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProductFormValues | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet<Product>(`/api/products/${id}`);
      setProduct(data);
      setForm(productToForm(data));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load this product.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  function setField(field: keyof ProductFormValues, value: string) {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setFormError("");
    try {
      const updated = await apiPut<Product>(`/api/products/${id}`, {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category.trim(),
        stockQuantity: Number.parseInt(form.stockQuantity, 10),
      });
      setProduct(updated);
      setForm(productToForm(updated));
      setEditing(false);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not save this product.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await apiDelete(`/api/products/${id}`);
      router.push("/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete.");
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="animate-pulse text-sm text-slate-500">
          Loading product…
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {error || "Product not found."}
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
            href="/products"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/products"
        className="text-sm font-semibold text-brand-700 hover:underline"
      >
        ← Back to products
      </Link>
      <h1 className="mt-3 text-3xl font-bold text-slate-900">
        {product.name}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {product.category} ·{" "}
        {product.stockQuantity > 0
          ? `In stock · ${product.stockQuantity}`
          : "Out of stock"}
      </p>
      {product.description && (
        <p className="mt-4 leading-relaxed text-slate-700">
          {product.description}
        </p>
      )}
      <p className="mt-4 text-2xl font-bold text-slate-900">
        {Number(product.price).toFixed(2)}{" "}
        <span className="text-sm font-semibold text-slate-500">MAD</span>
      </p>

      {!editing ? (
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Edit product
          </button>
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
              Delete
            </button>
          )}
        </div>
      ) : (
        <form
          onSubmit={(event) => void handleSave(event)}
          className="mt-6 grid gap-4 rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70 sm:grid-cols-2"
        >
          {formError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200 sm:col-span-2">
              {formError}
            </p>
          )}
          <div>
            <label className={labelCls} htmlFor="detail-product-name">
              Name *
            </label>
            <input
              id="detail-product-name"
              className={inputCls}
              value={form?.name ?? ""}
              onChange={(e) => setField("name", e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="detail-product-category">
              Category *
            </label>
            <input
              id="detail-product-category"
              className={inputCls}
              value={form?.category ?? ""}
              onChange={(e) => setField("category", e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="detail-product-price">
              Price (MAD) *
            </label>
            <input
              id="detail-product-price"
              className={inputCls}
              type="number"
              min="0"
              step="0.01"
              value={form?.price ?? ""}
              onChange={(e) => setField("price", e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="detail-product-stock">
              Stock *
            </label>
            <input
              id="detail-product-stock"
              className={inputCls}
              type="number"
              min="0"
              step="1"
              value={form?.stockQuantity ?? ""}
              onChange={(e) => setField("stockQuantity", e.target.value)}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="detail-product-description">
              Description
            </label>
            <textarea
              id="detail-product-description"
              className={inputCls}
              rows={3}
              value={form?.description ?? ""}
              onChange={(e) => setField("description", e.target.value)}
            />
          </div>
          <div className="flex gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setForm(productToForm(product));
                setFormError("");
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
