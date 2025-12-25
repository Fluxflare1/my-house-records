"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { getAdminMe } from "@/app/actions/admin-me";
import { PERMS } from "@/lib/auth/permissions";

type NavItem = { href: string; label: string; perm?: string };

const NAV: NavItem[] = [
  { href: "/admin", label: "Home" },

  { href: "/admin/setup", label: "Setup", perm: PERMS.MANAGE_SETUP },
  { href: "/admin/occupancy", label: "Occupancy", perm: PERMS.MANAGE_OCCUPANCY },

  { href: "/admin/rent", label: "Rent", perm: PERMS.MANAGE_RENT },
  { href: "/admin/bills", label: "Bills", perm: PERMS.MANAGE_BILLS },

  { href: "/admin/payments", label: "Payments", perm: PERMS.MANAGE_PAYMENTS },
  { href: "/admin/verification-queue", label: "Verification Queue", perm: PERMS.VERIFY_PAYMENTS },

  { href: "/admin/allocations", label: "Allocations", perm: PERMS.MANAGE_ALLOCATIONS },
  { href: "/admin/statements", label: "Statements", perm: PERMS.VIEW_STATEMENTS },

  { href: "/admin/reminders", label: "Reminders", perm: PERMS.MANAGE_REMINDERS },
  { href: "/admin/settings", label: "Settings", perm: PERMS.MANAGE_SETTINGS },

  { href: "/admin/admin-users", label: "Admin Users", perm: PERMS.MANAGE_ADMIN_USERS }
];

function hasPerm(userPerms: string[], need?: string) {
  if (!need) return true;
  if (userPerms.includes("*")) return true;
  return userPerms.includes(need);
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<{ fullName: string; email: string; permissions: string[] } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const x = await getAdminMe();
        setMe({ fullName: x.fullName, email: x.email, permissions: x.permissions || [] });
      } catch {
        // middleware will redirect to /admin/login if missing session
      }
    })();
  }, []);

  const visibleNav = useMemo(() => {
    const perms = me?.permissions || [];
    return NAV.filter((i) => hasPerm(perms, i.perm));
  }, [me]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="font-semibold">My House Records — Admin</div>

          <div className="flex items-center gap-3">
            {me && (
              <div className="text-xs text-gray-700 text-right">
                <div className="font-semibold">{me.fullName}</div>
                <div>{me.email}</div>
              </div>
            )}
            <Link className="text-sm underline" href="/logout">
              Logout
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-12 gap-4">
        <aside className="col-span-12 md:col-span-3">
          <nav className="rounded border bg-white p-3">
            <div className="text-xs font-semibold text-gray-600 mb-2">Navigation</div>
            <ul className="space-y-1">
              {visibleNav.map((l) => (
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
