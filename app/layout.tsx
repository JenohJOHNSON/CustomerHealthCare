import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Customer Leaving Risk Dashboard",
  description:
    "A simple dashboard that shows which customers may leave, why they may leave, and what revenue is at risk.",
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
