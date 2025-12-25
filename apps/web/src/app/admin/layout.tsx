import type { ReactNode } from "react";
import AdminShell from "@/components/admin/admin-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}

{ href: "/admin/occupancy/bond", label: "Bond Tenant", perm: PERMS.MANAGE_OCCUPANCY },
