import "server-only";

import { cookies } from "next/headers";
import { getAdminSession, hasPermission } from "@/lib/auth/admin-session";

/**
 * TENANT SESSION
 * Update TENANT_COOKIE_NAME if your tenant auth uses a different cookie name.
 */
const TENANT_COOKIE_NAME = "mhr_tenant_session";

export type TenantSession = {
  tenantId: string;
  phone?: string;
};

function parseJsonSafe<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getTenantSession(): TenantSession | null {
  const raw = cookies().get(TENANT_COOKIE_NAME)?.value || "";
  if (!raw) return null;

  const data = parseJsonSafe<TenantSession>(raw);
  if (!data || !data.tenantId) return null;

  return {
    tenantId: String(data.tenantId),
    phone: data.phone ? String(data.phone) : undefined
  };
}

export async function requireTenant(): Promise<TenantSession> {
  const session = getTenantSession();
  if (!session) throw new Error("TENANT_AUTH_REQUIRED");
  return session;
}

/**
 * ADMIN guards (RBAC)
 */
export async function requireAdmin() {
  const session = getAdminSession();
  if (!session) throw new Error("ADMIN_AUTH_REQUIRED");
  return session;
}

export async function requireAdminPermission(permission: string) {
  const session = await requireAdmin();
  if (!hasPermission(session, permission)) throw new Error("ADMIN_PERMISSION_DENIED");
  return session;
}

export async function requireAdminAnyPermission(permissions: string[]) {
  const session = await requireAdmin();
  const ok = permissions.some((p) => hasPermission(session, p));
  if (!ok) throw new Error("ADMIN_PERMISSION_DENIED");
  return session;
}
