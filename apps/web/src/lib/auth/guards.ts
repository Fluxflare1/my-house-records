import "server-only";

import { cookies } from "next/headers";
import { getAdminSession, hasPermission } from "@/lib/auth/admin-session";

/**
 * TENANT SESSION
 * We keep tenant and admin sessions separate.
 * Tenant session cookie name here must match your tenant auth implementation.
 *
 * If your project already uses a different cookie name for tenant,
 * update TENANT_COOKIE_NAME to match it.
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

/**
 * Basic tenant session reader.
 * This expects the tenant session cookie value to be JSON like:
 * {"tenantId":"ten_123","phone":"+234..."}
 *
 * If your tenant session is signed/encrypted elsewhere, tell me and I’ll align it.
 */
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

/**
 * Tenant guard used by tenant server actions/pages.
 */
export async function requireTenant(): Promise<TenantSession> {
  const session = getTenantSession();
  if (!session) {
    throw new Error("TENANT_AUTH_REQUIRED");
  }
  return session;
}

/**
 * ADMIN guards (RBAC)
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
