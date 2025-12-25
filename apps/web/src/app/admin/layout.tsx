import Link from "next/link";
import type { ReactNode } from "react";

const links = [
  { href: "/admin", label: "Home" },
  { href: "/admin/setup", label: "Setup" },
  { href: "/admin/occupancy", label: "Occupancy" },
  { href: "/admin/rent", label: "Rent" },
  { href: "/admin/bills", label: "Bills" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/verification-queue", label: "Verification Queue" },
  { href: "/admin/allocations", label: "Allocations" },
  { href: "/admin/statements", label: "Statements" },
  { href: "/admin/reminders", label: "Reminders" }
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="font-semibold">My House Records — Admin</div>
          <Link className="text-sm underline" href="/logout">
            Logout
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-12 gap-4">
        <aside className="col-span-12 md:col-span-3">
          <nav className="rounded border bg-white p-3">
            <div className="text-xs font-semibold text-gray-600 mb-2">Navigation</div>
            <ul className="space-y-1">
              {links.map((l) => (
                <li key={l.href}>
                  <Link className="block rounded px-3 py-2 text-sm hover:bg-gray-100" href={l.href}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="col-span-12 md:col-span-9">
          <div className="rounded border bg-white p-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
