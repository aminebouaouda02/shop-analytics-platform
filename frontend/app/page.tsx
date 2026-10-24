import Link from "next/link";

const FEATURES = [
  {
    icon: "🛍️",
    title: "Product catalogue",
    text: "A full product catalogue with categories, prices and live stock levels, managed through a secured REST API.",
    href: "/products",
    cta: "Browse products",
  },
  {
    icon: "🧾",
    title: "Orders",
    text: "Customers place orders in a few clicks. Totals are always computed on the server from current prices, never trusted from the client.",
    href: "/orders",
    cta: "See orders",
  },
  {
    icon: "📊",
    title: "Spark sales analytics",
    text: "Order data is aggregated with Apache Spark — revenue by category, best-selling products and sales trends — and shown as KPIs.",
    href: "/dashboard",
    cta: "Open the dashboard",
  },
];

const STEPS = [
  {
    title: "1. Order placed",
    text: "A customer orders a product from the Next.js storefront.",
  },
  {
    title: "2. Stored in PostgreSQL",
    text: "The Spring Boot backend validates the order and stores it in PostgreSQL.",
  },
  {
    title: "3. Spark aggregates sales",
    text: "A PySpark job reads the order data and computes sales aggregates.",
  },
  {
    title: "4. Dashboard shows KPIs",
    text: "The dashboard turns those results into clear sales indicators.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-violet-600 text-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="mb-4 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            Spring Boot · Next.js · Apache Spark
          </p>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
            An e-commerce platform that understands its own sales.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-brand-50">
            Shop Analytics is a small online shop — products, orders and secure
            accounts — with an analytics side powered by Spark, so you can see
            what is actually selling, by category and by product.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow transition hover:bg-brand-50"
            >
              Create account
            </Link>
            <Link
              href="/products"
              className="rounded-lg border border-white/60 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Browse products
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-bold text-slate-900">What the platform does</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          The transactional shop and the analytics pipeline are kept separate,
          the way they would be in a real system.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="flex flex-col rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70"
            >
              <span className="text-3xl" aria-hidden>
                {feature.icon}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {feature.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                {feature.text}
              </p>
              <Link
                href={feature.href}
                className="mt-4 text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                {feature.cta} →
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200/70"
              >
                <h3 className="font-semibold text-brand-700">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
