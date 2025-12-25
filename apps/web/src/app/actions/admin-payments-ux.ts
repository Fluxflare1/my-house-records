"use server";

import { requireAdmin } from "@/lib/auth/guards";
import { getAdapters } from "@/lib/adapters";

type Row = Record<string, any>;

function n(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

function s(v: any) {
  return String(v ?? "");
}

export type RecentPayment = {
  paymentId: string;
  apartmentId: string;
  tenantId: string;
  amount: number;
  paymentDate: string;
  verificationStatus: string;
  posReference: string;
  receiptUrl: string;
  label: string;
};

export async function getRecentPayments(limit = 15): Promise<RecentPayment[]> {
  await requireAdmin();
  const { sheets } = getAdapters();

  const [payments, apartments, tenants] = await Promise.all([
    sheets.getAll("payments"),
    sheets.getAll("apartments"),
    sheets.getAll("tenants")
  ]);

  const apartmentLabel = new Map<string, string>();
  for (const a of apartments as Row[]) {
    apartmentLabel.set(s(a.apartment_id), s(a.unit_label || a.apartment_id));
  }

  const tenantLabel = new Map<string, string>();
  for (const t of tenants as Row[]) {
    tenantLabel.set(s(t.tenant_id), s(t.full_name || t.tenant_id));
  }

  const sorted = (payments as Row[])
    .slice()
    .sort((a, b) => (s(b.created_at).localeCompare(s(a.created_at))));

  return sorted.slice(0, limit).map((p) => {
    const paymentId = s(p.payment_id);
    const apartmentId = s(p.apartment_id);
    const tenantId = s(p.tenant_id);
    const amount = n(p.amount);
    const paymentDate = s(p.payment_date);
    const verificationStatus = s(p.verification_status || "pending");
    const posReference = s(p.pos_reference || "");
    const receiptUrl = s(p.receipt_drive_file_url || "");

    const apt = apartmentLabel.get(apartmentId) ?? apartmentId;
    const ten = tenantId ? (tenantLabel.get(tenantId) ?? tenantId) : "—";

    return {
      paymentId,
      apartmentId,
      tenantId,
      amount,
      paymentDate,
      verificationStatus,
      posReference,
      receiptUrl,
      label: `Payment ${paymentId} | ₦${amount} | ${verificationStatus.toUpperCase()} | Apt ${apt} | Tenant ${ten} | ${paymentDate}`
    };
  });
}
