"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";

/** Order shape as returned by GET /api/orders. */
interface Order {
  id: number;
  product: { id: number; name: string };
  quantity: number;
  totalPrice: number;
  customerEmail: string;
  status: string;
}

/** Simple list page: fetches the orders from the API. */
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<Order[]>("/api/orders")
      .then(setOrders)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p style={{ padding: "2rem" }}>Loading orders…</p>;
  }
  if (error) {
    return <p style={{ padding: "2rem" }}>Error: {error}</p>;
  }

  return (
    <div style={{ maxWidth: "50rem", margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Orders</h1>
      {orders.length === 0 ? (
        <p>No orders yet. Create some with POST /api/orders.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {orders.map((order) => (
            <li
              key={order.id}
              style={{
                borderBottom: "1px solid #ddd",
                padding: "0.75rem 0",
              }}
            >
              <strong>Order #{order.id}</strong> — {order.product.name} ×{" "}
              {order.quantity} = {order.totalPrice.toFixed(2)} MAD
              <br />
              <small>
                {order.customerEmail} — status: {order.status}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
