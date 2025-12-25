"use server";

import { getAdapters } from "@/lib/adapters";
import { requireAdminPermission } from "@/lib/auth/guards";
import { PERMS } from "@/lib/auth/permissions";
import { hashPassword } from "@/lib/auth/password";
import { generateId } from "@/lib/utils/id";
import { nowISO } from "@/lib/utils/time";

type Row = Record<string, any>;
function s(v: any) { return String(v ?? "").trim(); }

function normalizeEmail(email: string) {
  return s(email).toLowerCase();
}

function parsePerms(perms: string) {
  const p = s(perms);
  if (!p) return [];
  return p.split(",").map((x) => x.trim()).filter(Boolean);
}

function permsToString(perms: string[]) {
  const cleaned = Array.from(new Set(perms.map((x) => s(x)).filter(Boolean)));
  return cleaned.join(",");
}

export type AdminUserDTO = {
  adminUserId: string;
  fullName: string;
  email: string;
  phone: string;
  status: "active" | "disabled";
  permissions: string[];
  createdAt: string;
};

function toDTO(r: Row): AdminUserDTO {
  return {
    adminUserId: s(r.admin_user_id),
    fullName: s(r.full_name),
    email: normalizeEmail(r.email),
    phone: s(r.phone),
    status: (s(r.status).toLowerCase() === "disabled" ? "disabled" : "active"),
    permissions: parsePerms(s(r.permissions)),
    createdAt: s(r.created_at)
  };
}

export async function listAdminUsers(): Promise<AdminUserDTO[]> {
  await requireAdminPermission(PERMS.MANAGE_ADMIN_USERS);

  const { sheets } = getAdapters();
  const rows = (await sheets.getAll("adminUsers")) as Row[];

  return rows
    .map(toDTO)
    .filter((u) => !!u.adminUserId && !!u.email)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createAdminUser(input: {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  permissions: string[];
}) {
  await requireAdminPermission(PERMS.MANAGE_ADMIN_USERS);

  const fullName = s(input.fullName);
  const email = normalizeEmail(input.email);
  const phone = s(input.phone || "");
  const password = s(input.password);
  const permissions = (input.permissions || []).map((x) => s(x)).filter(Boolean);

  if (!fullName) throw new Error("Full name is required");
  if (!email || !email.includes("@")) throw new Error("Valid email is required");
  if (password.length < 8) throw new Error("Password must be at least 8 characters");
  if (permissions.length === 0) throw new Error("Select at least one permission");

  const { sheets } = getAdapters();
  const existing = (await sheets.getAll("adminUsers")) as Row[];

  const dup = existing.find((u) => normalizeEmail(u.email) === email);
  if (dup) throw new Error("An admin user with this email already exists");

  const row = {
    admin_user_id: generateId("adm"),
    full_name: fullName,
    email,
    phone,
    password_hash: hashPassword(password),
    status: "active",
    permissions: permsToString(permissions),
    created_at: nowISO()
  };

  await sheets.appendRow("adminUsers", Object.values(row));
  return { ok: true, adminUserId: row.admin_user_id };
}

export async function setAdminUserStatus(input: { adminUserId: string; status: "active" | "disabled" }) {
  await requireAdminPermission(PERMS.MANAGE_ADMIN_USERS);

  const { sheets } = getAdapters();
  const id = s(input.adminUserId);
  if (!id) throw new Error("adminUserId is required");

  await sheets.updateRow("adminUsers", "admin_user_id", id, { status: input.status });
  return { ok: true };
}

export async function setAdminUserPermissions(input: { adminUserId: string; permissions: string[] }) {
  await requireAdminPermission(PERMS.MANAGE_ADMIN_USERS);

  const { sheets } = getAdapters();
  const id = s(input.adminUserId);
  if (!id) throw new Error("adminUserId is required");

  const perms = (input.permissions || []).map((x) => s(x)).filter(Boolean);
  if (perms.length === 0) throw new Error("Select at least one permission");

  await sheets.updateRow("adminUsers", "admin_user_id", id, { permissions: permsToString(perms) });
  return { ok: true };
}

export async function resetAdminUserPassword(input: { adminUserId: string; newPassword: string }) {
  await requireAdminPermission(PERMS.MANAGE_ADMIN_USERS);

  const { sheets } = getAdapters();
  const id = s(input.adminUserId);
  const pwd = s(input.newPassword);

  if (!id) throw new Error("adminUserId is required");
  if (pwd.length < 8) throw new Error("Password must be at least 8 characters");

  await sheets.updateRow("adminUsers", "admin_user_id", id, { password_hash: hashPassword(pwd) });
  return { ok: true };
}
