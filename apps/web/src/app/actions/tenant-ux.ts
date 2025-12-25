"use server";

import { requireTenant } from "@/lib/auth/guards";
import { getAdapters } from "@/lib/adapters";

type Row = Record<string, any>;

function n(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}
function s(v: any) {
  return String(v ?? "");
}

export type TenantPaymentOption = {
  id: string;
  label: string;
  amount: number;
  date: string;
  status: string;
  receiptUrl: string;
};

export async function getTenantRecentPayments(limit = 20): Promise<TenantPaymentOption[]> {
  const user = await requireTenant();
  const tenantId = user.tenantId;

  const { sheets } = getAdapters();
  const payments = await sheets.getAll("payments");

  const filtered = (payments as Row[])
    .filter((p) => s(p.tenant_id) === s(tenantId))
    .slice()
    .sort((a, b) => s(b.created_at).localeCompare(s(a.created_at)));

  return filtered.slice(0, limit).map((p) => {
    const id = s(p.payment_id);
    const amount = n(p.amount);
    const date = s(p.payment_date);
    const status = s(p.verification_status || "pending");
    const receiptUrl = s(p.receipt_drive_file_url || "");

    return {
      id,
      amount,
      date,
      status,
      receiptUrl,
      label: `Payment ${id} | ₦${amount} | ${status.toUpperCase()} | ${date}${receiptUrl ? " | Receipt attached" : ""}`
    };
  });
}
