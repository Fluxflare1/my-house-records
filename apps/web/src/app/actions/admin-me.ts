"use server";

import { requireAdmin } from "@/lib/auth/guards";

export async function getAdminMe() {
  const session = await requireAdmin();
  return {
    adminUserId: session.adminUserId,
    email: session.email,
    fullName: session.fullName,
    permissions: session.permissions
  };
}
