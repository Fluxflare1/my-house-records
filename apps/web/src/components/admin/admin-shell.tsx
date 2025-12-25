"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { getAdminMe } from "@/app/actions/admin-me";
import { PERMS } from "@/lib/auth/permissions";

type NavItem = { href: string; label: string; perm?: string };

const NAV: NavItem[] = [
  { href: "/admin", label: "Home" },

  { href: "/admin/setup", label: "Setup", perm: PERMS.MANAGE_SETUP },
  { href: "/admin/occupancy", label: "Occupancy", perm: PERMS.MANAGE_OCCUPANCY },

  { href: "/admin/rent", label: "Rent", perm: PERMS.MANAGE_RENT },
  { href: "/admin/rent/generate", label: "Generate Rent", perm: PERMS.MANAGE_RENT },

  { href: "/admin/bills", label: "Bills", perm: PERMS.MANAGE_BILLS },
  { href: "/admin/bills/generate", label: "Generate Bills", perm: PERMS.MANAGE_BILLS },

  { href: "/admin/payments", label: "Payments", perm: PERMS.MANAGE_PAYMENTS },
  { href: "/admin/verification-queue", label: "Verification Queue", perm: PERMS.VERIFY_PAYMENTS },

  { href: "/admin/allocations", label: "Allocations", perm: PERMS.MANAGE_ALLOCATIONS },
  { href: "/admin/allocations/suggest", label: "Suggest Allocations", perm: PERMS.MANAGE_ALLOCATIONS },

  { href: "/admin/statements", label: "Statements", perm: PERMS.VIEW_STATEMENTS },
  { href: "/admin/statements/apartment", label: "Apartment Statement", perm: PERMS.VIEW_STATEMENTS },

  { href: "/admin/reminders", label: "Reminders", perm: PERMS.MANAGE_REMINDERS },
  { href: "/admin/settings", label: "Settings", perm: PERMS.MANAGE_SETTINGS },

  { href: "/admin/admin-users", label: "Admin Users", perm: PERMS.MANAGE_ADMIN_USERS }
];

function hasPerm(perms: string[] | undefined, perm?: string) {
  if (!perm) return true;
  if (!perms) return false;
  return perms.includes(perm);
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<{ email?: string; fullName?: string; role?: string; permissions?: string[] } | null>(null);
  const [error, setError] = useState<string>("");

  const onLoginPage = pathname === "/admin/login" || pathname.startsWith("/admin/login/");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await getAdminMe(); // returns null if not logged in
        if (!alive) return;
        setMe(r);
        setError("");
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Failed to load admin session");
        setMe(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const visibleNav = useMemo(() => {
    const perms = me?.permissions || [];
    return NAV.filter((n) => hasPerm(perms, n.perm));
  }, [me]);

  // Redirect to admin login when not logged in (but NEVER while already on login page)
  useEffect(() => {
    if (!loading && (!me || error) && !onLoginPage) {
      window.location.href = "/admin/login";
    }
  }, [loading, me, error, onLoginPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="rounded border bg-white p-4 text-sm">Loading admin…</div>
      </div>
    );
  }

  // Allow /admin/login to render without shell if not authenticated
  if (!me && onLoginPage) {
    return <>{children}</>;
  }

  // If not authenticated on protected pages, show message briefly (redirect will happen)
  if (!me && !onLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="rounded border bg-white p-4 text-sm">
          Admin authentication required. Redirecting…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="font-semibold">My House Records — Admin</div>
          <div className="text-xs text-gray-600">
            {me.fullName || me.email || "Admin"} {me.role ? `(${me.role})` : ""}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4">
        <aside className="rounded border bg-white p-3 h-fit">
          <nav className="space-y-1">
            {visibleNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded px-3 py-2 text-sm ${
                    active ? "bg-black text-white" : "hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="rounded border bg-white p-4">{children}</main>
      </div>
    </div>
  );
}
