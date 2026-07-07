import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Customer Health Intelligence Pipeline",
  description:
    "Cloud customer churn analytics with Airbyte, Neon PostgreSQL, Python, Next.js, and OpenAI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
