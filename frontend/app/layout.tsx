import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shop Analytics Platform",
  description: "E-commerce platform with sales analytics — Spring Boot, Next.js and Spark",
};

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/orders", label: "Orders" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b border-white/40 bg-white/80 shadow-sm backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-lg font-bold text-white shadow-card">
                🛒
              </span>
              <span className="leading-tight">
                <span className="block text-base font-bold text-slate-900">
                  Shop Analytics
                </span>
                <span className="block text-xs font-medium text-brand-600">
                  E-commerce + Spark KPIs
                </span>
              </span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
              >
                Register
              </Link>
            </div>
          </div>
        </header>

        <main className="w-full flex-1">{children}</main>

        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-6">
            <p>
              <span className="font-semibold text-slate-700">Shop Analytics Platform</span>{" "}
              — PFE portfolio project by Amine Bouaouda.
            </p>
            <p>Spring Boot · Next.js · Apache Spark</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
