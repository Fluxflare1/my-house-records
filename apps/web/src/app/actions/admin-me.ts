"use server";

import "server-only";

import { getAdminSession } from "@/lib/auth/admin-session";

/**
 * Returns current admin session if logged in, otherwise null.
 * Must never throw for "not logged in" because layout calls this.
 */
export async function getAdminMe() {
  const session = getAdminSession();
  if (!session) return null;

  return {
    email: session.email,
    fullName: session.fullName,
    role: session.role,
    permissions: session.permissions
  };
}
