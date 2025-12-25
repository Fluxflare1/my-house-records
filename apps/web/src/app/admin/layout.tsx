import type { ReactNode } from "react";
import AdminShell from "@/components/admin/admin-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}

{ href: "/admin/applicants", label: "Applicants", perm: PERMS.MANAGE_OCCUPANCY },
{ href: "/admin/setup/schema", label: "Schema", perm: PERMS.MANAGE_SETUP },
