import "./globals.css";
import type { ReactNode } from "react";
import SiteHeader from "@/components/site/site-header";
import SiteFooter from "@/components/site/site-footer";

export const metadata = {
  title: "My House",
  description: "Manage occupancy, rent, bills, payments, receipts and statements."
};

export const viewport = {
  themeColor: "#0a0a0a"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        <SiteHeader />
        <main className="min-h-[calc(100vh-160px)]">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
