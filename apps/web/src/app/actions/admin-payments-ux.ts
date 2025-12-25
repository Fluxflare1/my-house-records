"use server";

import { requireAdminAnyPermission } from "@/lib/auth/guards";
import { PERMS } from "@/lib/auth/permissions";
import { getAdapters } from "@/lib/adapters";

type Row = Record<string, any>;
function s(v: any) { return String(v ?? "").trim(); }
function n(v: any) { const x = Number(v ?? 0); return Number.isFinite(x) ? x : 0; }

export type RecentPayment = {
  paymentId: string;
  label: string;
  verificationStatus: string;
  receiptUrl: string;
};

export async function getRecentPayments(limit = 20): Promise<RecentPayment[]> {
  await requireAdminAnyPermission([PERMS.MANAGE_PAYMENTS, PERMS.VERIFY_PAYMENTS]);

  const { sheets } = getAdapters();
  const [payments, apartments, tenants] = await Promise.all([
    sheets.getAll("payments"),
    sheets.getAll("apartments"),
    sheets.getAll("tenants")
  ]);

  const aptLabel = new Map<string, string>();
  for (const a of apartments as Row[]) aptLabel.set(s(a.apartment_id), s(a.unit_label || a.apartment_id));

  const tenantName = new Map<string, string>();
  for (const t of tenants as Row[]) tenantName.set(s(t.tenant_id), s(t.full_name || t.tenant_id));

  return (payments as Row[])
    .slice()
    .sort((a, b) => s(b.created_at).localeCompare(s(a.created_at)))
    .slice(0, limit)
    .map((p) => {
      const id = s(p.payment_id);
      const apt = aptLabel.get(s(p.apartment_id)) ?? s(p.apartment_id);
      const ten = s(p.tenant_id) ? (tenantName.get(s(p.tenant_id)) ?? s(p.tenant_id)) : "—";
      const amt = n(p.amount);
      const date = s(p.payment_date);
      const status = s(p.verification_status || "pending");
      const receiptUrl = s(p.receipt_drive_file_url || "");

      return {
        paymentId: id,
        label: `${id} | ₦${amt} | ${date} | Apt ${apt} | Tenant ${ten} | ${status.toUpperCase()}`,
        verificationStatus: status,
        receiptUrl
      };
    });
}
