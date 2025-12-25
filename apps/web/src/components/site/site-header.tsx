"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/#features", label: "Features" },
  { href: "/#availability", label: "Availability" },
  { href: "/#contact", label: "Contact" }
];

export default function SiteHeader() {
  const pathname = usePathname();

  // Hide public header on admin routes
  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 border-b bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-black" />
          <div className="leading-tight">
            <div className="text-sm font-semibold">My House</div>
            <div className="text-xs text-gray-500">Records & Occupancy</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-sm text-gray-700 hover:text-black"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login/tenant"
            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Login
          </Link>

          <Link
            href="/request-access"
            className="rounded-md bg-black px-3 py-2 text-sm text-white hover:opacity-90"
          >
            Request for Access
          </Link>
        </div>
      </div>
    </header>
  );
}
