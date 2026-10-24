"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";

/** Product shape as returned by GET /api/products. */
interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  stockQuantity: number;
}

/** Simple list page: fetches the product catalogue from the API. */
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<Product[]>("/api/products")
      .then(setProducts)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p style={{ padding: "2rem" }}>Loading products…</p>;
  }
  if (error) {
    return <p style={{ padding: "2rem" }}>Error: {error}</p>;
  }

  return (
    <div style={{ maxWidth: "50rem", margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Products</h1>
      {products.length === 0 ? (
        <p>No products yet. Create some with POST /api/products.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {products.map((product) => (
            <li
              key={product.id}
              style={{
                borderBottom: "1px solid #ddd",
                padding: "0.75rem 0",
              }}
            >
              <strong>{product.name}</strong> — {product.category} —{" "}
              {product.price.toFixed(2)} MAD
              <br />
              <small>Stock: {product.stockQuantity}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
