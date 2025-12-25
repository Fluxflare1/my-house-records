import "server-only";

import { getAdminSession, hasPermission } from "@/lib/auth/admin-session";

/**
 * Tenant guards remain as they were in your system.
 * We only add/replace admin guards here.
 *
 * If you already have requireTenant() in another file, keep it unchanged.
 * This file focuses on admin auth.
 */
export async function requireAdmin() {
  const session = getAdminSession();
  if (!session) {
    throw new Error("ADMIN_AUTH_REQUIRED");
  }
  return session;
}

export async function requireAdminPermission(permission: string) {
  const session = await requireAdmin();
  if (!hasPermission(session, permission)) {
    throw new Error("ADMIN_PERMISSION_DENIED");
  }
  return session;
}
