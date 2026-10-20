import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shop Analytics Platform",
  description: "E-commerce platform with sales analytics — Spring Boot, Next.js and Spark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #e5e7eb" }}>
          <strong>Shop Analytics Platform</strong>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
