export default function HomePage() {
  // Day 1: static placeholder. The health check will be wired to
  // lib/api.ts -> checkHealth() in a later step.
  const backendStatus = "Not checked yet — start the backend and visit /api/health";

  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
        Shop Analytics Platform
      </h1>
      <p style={{ color: "#4b5563", lineHeight: 1.6 }}>
        An e-commerce project with a Spring Boot backend, a Next.js frontend,
        and Spark jobs that analyse sales data by category and product.
      </p>

      <div
        style={{
          marginTop: "1.5rem",
          padding: "1rem",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
        }}
      >
        <h2 style={{ fontSize: "1rem", marginTop: 0 }}>Backend status</h2>
        <p style={{ marginBottom: 0, color: "#374151" }}>{backendStatus}</p>
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <h2 style={{ fontSize: "1rem" }}>Coming next</h2>
        <ul style={{ color: "#374151", lineHeight: 1.8 }}>
          <li>Product catalogue (API + pages)</li>
          <li>Orders flow</li>
          <li>Analytics dashboard from Spark results</li>
        </ul>
      </div>
    </section>
  );
}
