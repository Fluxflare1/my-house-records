"use server";

import { getAdapters } from "@/lib/adapters";
import { createAdminSessionToken, setAdminSessionCookie, clearAdminSessionCookie } from "@/lib/auth/admin-session";
import { verifyPassword, hashPassword } from "@/lib/auth/password";

type Row = Record<string, any>;
function s(v: any) { return String(v ?? "").trim(); }

function parsePerms(perms: string) {
  const p = s(perms);
  if (!p) return [];
  return p.split(",").map(x => x.trim()).filter(Boolean);
}

export async function adminLogin(input: { email: string; password: string }) {
  const email = s(input.email).toLowerCase();
  const password = s(input.password);
  if (!email || !password) throw new Error("Email and password are required");

  // 1) Bootstrap admin (first login / emergency)
  const bootEmail = s(process.env.BOOTSTRAP_ADMIN_EMAIL).toLowerCase();
  const bootPass = s(process.env.BOOTSTRAP_ADMIN_PASSWORD);

  if (bootEmail && bootPass && email === bootEmail && password === bootPass) {
    const token = createAdminSessionToken({
      adminUserId: "bootstrap_admin",
      email: bootEmail,
      fullName: "Bootstrap Admin",
      permissions: ["*"]
    });
    setAdminSessionCookie(token);
    return { ok: true, mode: "bootstrap" as const };
  }

  // 2) Sheet-based admin users
  const { sheets } = getAdapters();
  const users = (await sheets.getAll("adminUsers")) as Row[];

  const user = users.find((u) => s(u.email).toLowerCase() === email);
  if (!user) throw new Error("Invalid credentials");

  if (s(user.status).toLowerCase() !== "active") {
    throw new Error("Account disabled");
  }

  const storedHash = s(user.password_hash);
  if (!storedHash) throw new Error("Account has no password set");

  if (!verifyPassword(password, storedHash)) {
    throw new Error("Invalid credentials");
  }

  const token = createAdminSessionToken({
    adminUserId: s(user.admin_user_id),
    email,
    fullName: s(user.full_name) || email,
    permissions: parsePerms(s(user.permissions))
  });
  setAdminSessionCookie(token);

  return { ok: true, mode: "sheet" as const };
}

export async function adminLogout() {
  clearAdminSessionCookie();
  return { ok: true };
}

/**
 * Optional helper for RBAC Action 3: set an admin password hash.
 * You won't call this from UI yet. It’s here for completeness.
 */
export async function makePasswordHash(plain: string) {
  return hashPassword(plain);
}
