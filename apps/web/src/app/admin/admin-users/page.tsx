"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listAdminUsers,
  createAdminUser,
  setAdminUserStatus,
  setAdminUserPermissions,
  resetAdminUserPassword,
  AdminUserDTO
} from "@/app/actions/admin-users";
import { PERMS } from "@/lib/auth/permissions";

type PermKey = keyof typeof PERMS;

const PERMISSION_LIST: { key: PermKey; label: string; description: string }[] = [
  { key: "MANAGE_SETUP", label: "Setup", description: "Properties, apartment types, apartments, tenants" },
  { key: "MANAGE_OCCUPANCY", label: "Occupancy", description: "Bond tenant ↔ apartment, vacate" },
  { key: "MANAGE_RENT", label: "Rent", description: "Create and manage rent records" },
  { key: "MANAGE_BILLS", label: "Bills", description: "Create and manage bills/charges" },
  { key: "MANAGE_PAYMENTS", label: "Payments", description: "Record payments and upload receipts (admin-side)" },
  { key: "VERIFY_PAYMENTS", label: "Verify Payments", description: "Verify/reject payments + access verification queue" },
  { key: "MANAGE_ALLOCATIONS", label: "Allocations", description: "Apply payments to rent/bills" },
  { key: "VIEW_STATEMENTS", label: "Statements", description: "View statements and balances" },
  { key: "MANAGE_REMINDERS", label: "Reminders", description: "Generate debtors report and send reminders" },
  { key: "MANAGE_SETTINGS", label: "Settings", description: "Edit system settings tenants can see" },
  { key: "MANAGE_ADMIN_USERS", label: "Admin Users", description: "Create/disable admin users and set permissions" }
];

function normalizeEmail(v: string) {
  return String(v || "").trim().toLowerCase();
}

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<AdminUserDTO[]>([]);

  // Create form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [createPerms, setCreatePerms] = useState<string[]>([]);

  // Edit panel
  const [selectedId, setSelectedId] = useState<string>("");
  const selected = useMemo(() => rows.find(r => r.adminUserId === selectedId) || null, [rows, selectedId]);

  const [editPerms, setEditPerms] = useState<string[]>([]);
  const [newPassword, setNewPassword] = useState("");

  async function refresh() {
    setLoading(true);
    try {
      const data = await listAdminUsers();
      setRows(data);
      if (selectedId && !data.find(d => d.adminUserId === selectedId)) {
        setSelectedId("");
      }
    } catch (e: any) {
      alert(e?.message || "Failed to load admin users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    if (selected) setEditPerms(selected.permissions || []);
  }, [selected]);

  function toggle(list: string[], value: string) {
    return list.includes(value) ? list.filter(x => x !== value) : [...list, value];
  }

  async function doCreate() {
    const em = normalizeEmail(email);
    if (!fullName.trim()) return alert("Full name is required");
    if (!em || !em.includes("@")) return alert("Valid email is required");
    if (password.trim().length < 8) return alert("Password must be at least 8 characters");
    if (createPerms.length === 0) return alert("Select at least one permission");

    await createAdminUser({
      fullName,
      email: em,
      phone,
      password,
      permissions: createPerms
    });

    setFullName(""); setEmail(""); setPhone(""); setPassword(""); setCreatePerms([]);
    alert("Admin user created");
    await refresh();
  }

  async function doToggleStatus(u: AdminUserDTO) {
    const next = u.status === "active" ? "disabled" : "active";
    if (!confirm(`Set ${u.email} to ${next.toUpperCase()}?`)) return;
    await setAdminUserStatus({ adminUserId: u.adminUserId, status: next });
    await refresh();
  }

  async function doSavePerms() {
    if (!selected) return;
    if (editPerms.length === 0) return alert("Select at least one permission");
    await setAdminUserPermissions({ adminUserId: selected.adminUserId, permissions: editPerms });
    alert("Permissions updated");
    await refresh();
  }

  async function doResetPassword() {
    if (!selected) return;
    if (newPassword.trim().length < 8) return alert("Password must be at least 8 characters");
    if (!confirm(`Reset password for ${selected.email}?`)) return;
    await resetAdminUserPassword({ adminUserId: selected.adminUserId, newPassword });
    setNewPassword("");
    alert("Password updated");
    await refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin Users</h1>
        <p className="text-sm text-gray-700">
          Create staff accounts and control access. Only users with <b>manage_admin_users</b> can use this page.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Create */}
        <section className="rounded border bg-white p-4 space-y-4">
          <div className="text-sm font-semibold">Create Admin User</div>

          <div className="space-y-1">
            <label className="text-sm">Full name</label>
            <input className="w-full border p-2" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-sm">Email</label>
              <input className="w-full border p-2" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm">Phone (optional)</label>
              <input className="w-full border p-2" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm">Password</label>
            <input className="w-full border p-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold">Permissions</div>
            <div className="space-y-1">
              {PERMISSION_LIST.map((p) => {
                const value = (PERMS as any)[p.key] as string;
                return (
                  <label key={value} className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={createPerms.includes(value)}
                      onChange={() => setCreatePerms(toggle(createPerms, value))}
                    />
                    <span>
                      <b>{p.label}</b>{" "}
                      <span className="text-xs text-gray-600">— {p.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <button className="rounded bg-black px-4 py-2 text-white text-sm" onClick={doCreate}>
            Create User
          </button>
        </section>

        {/* List + edit */}
        <section className="rounded border bg-white p-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold">Existing Admin Users</div>
            <button className="rounded border px-3 py-2 text-sm" onClick={refresh}>
              Refresh
            </button>
          </div>

          {loading && <div className="text-sm text-gray-600">Loading...</div>}

          {!loading && rows.length === 0 && (
            <div className="text-sm text-gray-600">
              No admin users found yet. Use bootstrap admin to create your first admin user.
            </div>
          )}

          <div className="space-y-2">
            {rows.map((u) => (
              <div key={u.adminUserId} className={`rounded border p-3 ${u.adminUserId === selectedId ? "border-black" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <button className="text-left" onClick={() => setSelectedId(u.adminUserId)}>
                    <div className="text-sm font-semibold">{u.fullName || u.email}</div>
                    <div className="text-xs text-gray-700">{u.email}</div>
                    <div className="text-xs text-gray-600">
                      Status: <b>{u.status.toUpperCase()}</b>
                    </div>
                  </button>

                  <button className="rounded border px-3 py-2 text-sm" onClick={() => doToggleStatus(u)}>
                    {u.status === "active" ? "Disable" : "Enable"}
                  </button>
                </div>

                <div className="mt-2 text-xs text-gray-700">
                  Permissions: {u.permissions.length ? u.permissions.join(", ") : "—"}
                </div>
              </div>
            ))}
          </div>

          {selected && (
            <div className="pt-4 border-t space-y-3">
              <div className="text-sm font-semibold">Edit: {selected.email}</div>

              <div className="space-y-1">
                {PERMISSION_LIST.map((p) => {
                  const value = (PERMS as any)[p.key] as string;
                  return (
                    <label key={value} className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={editPerms.includes(value)}
                        onChange={() => setEditPerms(toggle(editPerms, value))}
                      />
                      <span>
                        <b>{p.label}</b>{" "}
                        <span className="text-xs text-gray-600">— {p.description}</span>
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2">
                <button className="rounded bg-black px-4 py-2 text-white text-sm" onClick={doSavePerms}>
                  Save Permissions
                </button>
              </div>

              <div className="pt-3 border-t space-y-2">
                <div className="text-sm font-semibold">Reset Password</div>
                <input
                  className="w-full border p-2"
                  type="password"
                  placeholder="New password (min 8 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button className="rounded border px-4 py-2 text-sm" onClick={doResetPassword}>
                  Reset Password
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
