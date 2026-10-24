"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "../../../lib/api";

/** Product shape as returned by GET /api/products. */
interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  stockQuantity: number;
}

/** Payload of POST /api/products and PUT /api/products/{id} (ProductRequest DTO). */
interface ProductPayload {
  name: string;
  description: string;
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

const EMPTY_FORM: ProductFormValues = {
  name: "",
  description: "",
  price: "",
  category: "",
  stockQuantity: "0",
};

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200";
const labelCls = "block text-sm font-medium text-slate-700";

type SortKey = "name" | "price-asc" | "price-desc";

function ProductForm({
  initial,
  submitLabel,
  submitting,
  error,
  onSubmit,
  onCancel,
}: {
  initial: ProductFormValues;
  submitLabel: string;
  submitting: boolean;
  error: string;
  onSubmit: (payload: ProductPayload) => void;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<ProductFormValues>(initial);

  function set(field: keyof ProductFormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit({
      name: values.name.trim(),
      description: values.description.trim(),
      price: Number(values.price),
      category: values.category.trim(),
      stockQuantity: Number.parseInt(values.stockQuantity, 10),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className={labelCls} htmlFor="product-name">
          Name *
        </label>
        <input
          id="product-name"
          className={inputCls}
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          required
          maxLength={150}
          placeholder="Wireless Mouse"
        />
      </div>
      <div>
        <label className={labelCls} htmlFor="product-category">
          Category *
        </label>
        <input
          id="product-category"
          className={inputCls}
          value={values.category}
          onChange={(e) => set("category", e.target.value)}
          required
          maxLength={100}
          placeholder="Electronics"
        />
      </div>
      <div>
        <label className={labelCls} htmlFor="product-price">
          Price (MAD) *
        </label>
        <input
          id="product-price"
          className={inputCls}
          type="number"
          min="0"
          step="0.01"
          value={values.price}
          onChange={(e) => set("price", e.target.value)}
          required
          placeholder="24.99"
        />
      </div>
      <div>
        <label className={labelCls} htmlFor="product-stock">
          Stock quantity *
        </label>
        <input
          id="product-stock"
          className={inputCls}
          type="number"
          min="0"
          step="1"
          value={values.stockQuantity}
          onChange={(e) => set("stockQuantity", e.target.value)}
          required
        />
      </div>
      <div className="sm:col-span-2">
        <label className={labelCls} htmlFor="product-description">
          Description
        </label>
        <textarea
          id="product-description"
          className={inputCls}
          rows={3}
          maxLength={1000}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Short description of the product (optional)"
        />
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200 sm:col-span-2">
          {error}
        </p>
      )}
      <div className="flex gap-2 sm:col-span-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<SortKey>("name");

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createKey, setCreateKey] = useState(0);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<ProductFormValues>(EMPTY_FORM);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (withSkeleton = false) => {
    if (withSkeleton) {
      setLoading(true);
    }
    setError("");
    try {
      const data = await apiGet<Product[]>("/api/products");
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(true);
  }, [load]);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products]
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(term);
      const matchesCategory = category === "All" || p.category === category;
      return matchesSearch && matchesCategory;
    });
    const sorted = [...filtered];
    if (sort === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "price-asc") {
      sorted.sort((a, b) => Number(a.price) - Number(b.price));
    } else {
      sorted.sort((a, b) => Number(b.price) - Number(a.price));
    }
    return sorted;
  }, [products, search, category, sort]);

  async function handleCreate(payload: ProductPayload) {
    setCreating(true);
    setCreateError("");
    try {
      await apiPost<Product>("/api/products", payload);
      setShowCreate(false);
      setCreateKey((k) => k + 1);
      await load();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Could not create the product.");
    } finally {
      setCreating(false);
    }
  }

  function toggleDetails(product: Product) {
    if (expandedId === product.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(product.id);
    setConfirmDeleteId(null);
    setEditError("");
    setEditValues({
      name: product.name,
      description: product.description ?? "",
      price: String(product.price),
      category: product.category,
      stockQuantity: String(product.stockQuantity),
    });
  }

  async function handleEdit(product: Product, payload: ProductPayload) {
    setSavingEdit(true);
    setEditError("");
    try {
      await apiPut<Product>(`/api/products/${product.id}`, payload);
      setExpandedId(null);
      await load();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Could not save the changes.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(product: Product) {
    setDeleting(true);
    try {
      await apiDelete(`/api/products/${product.id}`);
      setConfirmDeleteId(null);
      setExpandedId(null);
      await load();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Could not delete the product.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            The product catalogue, served by the Spring Boot API.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          {showCreate ? "Close form" : "+ New product"}
        </button>
      </div>

      {showCreate && (
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">New product</h2>
          <ProductForm
            key={createKey}
            initial={EMPTY_FORM}
            submitLabel="Create product"
            submitting={creating}
            error={createError}
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        </section>
      )}

      {/* Filters */}
      <section className="mt-6 rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-200/70">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            className={inputCls}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name…"
            aria-label="Search products by name"
          />
          <select
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 md:w-56"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort products"
          >
            <option value="name">Name A–Z</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {["All", ...categories].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={
                category === cat
                  ? "rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white"
                  : "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-brand-50 hover:text-brand-700"
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Content states */}
      {loading ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading products">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="animate-pulse rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70"
            >
              <div className="h-4 w-2/3 rounded bg-slate-200" />
              <div className="mt-3 h-3 w-1/3 rounded bg-slate-200" />
              <div className="mt-4 h-3 w-full rounded bg-slate-100" />
              <div className="mt-2 h-3 w-5/6 rounded bg-slate-100" />
              <div className="mt-5 h-7 w-1/2 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl bg-red-50 p-6 text-center ring-1 ring-red-200">
          <p className="font-semibold text-red-800">Could not load the products.</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => void load(true)}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-card ring-1 ring-slate-200/70">
          <p className="text-4xl" aria-hidden>
            🛍️
          </p>
          <h2 className="mt-3 text-lg font-semibold text-slate-900">No products yet</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            The catalogue is empty. Create the first product and it will appear here.
          </p>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="mt-5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            + New product
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-card ring-1 ring-slate-200/70">
          <h2 className="text-lg font-semibold text-slate-900">No products match</h2>
          <p className="mt-1 text-sm text-slate-500">
            Try a different search term or category.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product) => {
            const inStock = product.stockQuantity > 0;
            const expanded = expandedId === product.id;
            return (
              <article
                key={product.id}
                className="flex flex-col rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold leading-snug text-slate-900">
                    {product.name}
                  </h2>
                  <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
                    {product.category}
                  </span>
                </div>
                {product.description && (
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                    {product.description}
                  </p>
                )}
                <div className="mt-4 flex items-end justify-between">
                  <p className="text-2xl font-bold text-slate-900">
                    {Number(product.price).toFixed(2)}{" "}
                    <span className="text-sm font-semibold text-slate-500">MAD</span>
                  </p>
                  <span
                    className={
                      inStock
                        ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200"
                        : "rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200"
                    }
                  >
                    {inStock ? `In stock · ${product.stockQuantity}` : "Out of stock"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleDetails(product)}
                  className="mt-4 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
                >
                  {expanded ? "Hide details" : "Details & edit"}
                </button>

                {expanded && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <dl className="mb-4 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <dt className="text-slate-400">Product ID</dt>
                        <dd className="font-medium text-slate-700">#{product.id}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-400">Stock</dt>
                        <dd className="font-medium text-slate-700">
                          {product.stockQuantity} units
                        </dd>
                      </div>
                    </dl>
                    <ProductForm
                      key={`edit-${product.id}`}
                      initial={editValues}
                      submitLabel="Save changes"
                      submitting={savingEdit}
                      error={editError}
                      onSubmit={(payload) => void handleEdit(product, payload)}
                    />
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      {confirmDeleteId === product.id ? (
                        <div className="rounded-lg bg-red-50 p-3 ring-1 ring-red-200">
                          <p className="text-sm font-medium text-red-800">
                            Delete “{product.name}” for good?
                          </p>
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              disabled={deleting}
                              onClick={() => void handleDelete(product)}
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                            >
                              {deleting ? "Deleting…" : "Yes, delete"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-white"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(product.id)}
                          className="rounded-lg px-3 py-1.5 text-sm font-semibold text-red-600 ring-1 ring-red-200 transition hover:bg-red-50"
                        >
                          Delete product
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
