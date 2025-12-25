import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/auth/admin-session";
import AdminShell from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();

  // Server-side gate: if no admin session, do NOT render admin pages at all.
  if (!session) {
    redirect("/admin/login");
  }

  return <AdminShell me={session}>{children}</AdminShell>;
}
