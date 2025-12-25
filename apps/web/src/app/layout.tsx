import "./globals.css";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata = {
  title: "My House",
  description: "My House Records"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        {/* Global Public Header */}
        <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
            <div className="font-semibold">My House</div>

            <nav className="hidden md:flex items-center gap-5 text-sm text-gray-700">
              <Link className="hover:underline" href="/">Home</Link>
              <Link className="hover:underline" href="/#features">Features</Link>
              <Link className="hover:underline" href="/#availability">Availability</Link>
              <Link className="hover:underline" href="/contact">Contact</Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link className="text-sm hover:underline" href="/login/tenant">Login</Link>
              <Link
                className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:opacity-90"
                href="/request-access"
              >
                Request for Access
              </Link>
              <Link className="text-sm hover:underline" href="/admin/login">Admin</Link>
            </div>
          </div>
        </header>

        {children}

        {/* Global Public Footer */}
        <footer className="border-t bg-white">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-600">
            © {new Date().getFullYear()} My House
          </div>
        </footer>
      </body>
    </html>
  );
}
