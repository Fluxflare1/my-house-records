"use server";

import { requireAdmin } from "@/lib/auth/guards";
import { getAdapters } from "@/lib/adapters";

type Row = Record<string, any>;
function s(v: any) { return String(v ?? ""); }
function n(v: any) { const x = Number(v ?? 0); return Number.isFinite(x) ? x : 0; }

export type QueueItem = {
  paymentId: string;
  apartmentId: string;
  apartmentLabel: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  paymentDate: string;
  posReference: string;
  receiptUrl: string;
  createdAt: string;
};

export async function getVerificationQueue(limit = 50): Promise<QueueItem[]> {
  await requireAdmin();
  const { sheets } = getAdapters();

  const [payments, apartments, tenants] = await Promise.all([
    sheets.getAll("payments"),
    sheets.getAll("apartments"),
    sheets.getAll("tenants")
  ]);

  const aptLabel = new Map<string, string>();
  for (const a of apartments as Row[]) {
    aptLabel.set(s(a.apartment_id), s(a.unit_label || a.apartment_id));
  }

  const tenantName = new Map<string, string>();
  for (const t of tenants as Row[]) {
    tenantName.set(s(t.tenant_id), s(t.full_name || t.tenant_id));
  }

  const items = (payments as Row[])
    .filter((p) => s(p.verification_status).toLowerCase() === "pending")
    .filter((p) => !!s(p.receipt_drive_file_url).trim())
    .slice()
    .sort((a, b) => s(b.created_at).localeCompare(s(a.created_at)))
    .slice(0, limit)
    .map((p) => {
      const paymentId = s(p.payment_id);
      const apartmentId = s(p.apartment_id);
      const tenantId = s(p.tenant_id);

      return {
        paymentId,
        apartmentId,
        apartmentLabel: aptLabel.get(apartmentId) ?? apartmentId,
        tenantId,
        tenantName: tenantId ? (tenantName.get(tenantId) ?? tenantId) : "—",
        amount: n(p.amount),
        paymentDate: s(p.payment_date),
        posReference: s(p.pos_reference || ""),
        receiptUrl: s(p.receipt_drive_file_url || ""),
        createdAt: s(p.created_at || "")
      };
    });

  return items;
}
