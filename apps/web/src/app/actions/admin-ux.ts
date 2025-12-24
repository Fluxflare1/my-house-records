"use server";

import { requireAdmin } from "@/lib/auth/guards";
import { getAdapters } from "@/lib/adapters";

type Row = Record<string, any>;

function n(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

export type PaymentOption = {
  id: string;
  label: string;
  amount: number;
  verified: boolean;
};

export type ChargeOption = {
  id: string;
  kind: "rent" | "bill";
  label: string;
  expected: number;
  applied: number;
  balance: number;
  occupancyId: string;
  apartmentId: string;
};

export async function getAllocationUxData() {
  await requireAdmin();
  const { sheets } = getAdapters();

  const [payments, allocations, rents, bills, apartments, tenants] = await Promise.all([
    sheets.getAll("payments"),
    sheets.getAll("allocations"),
    sheets.getAll("rents"),
    sheets.getAll("bills"),
    sheets.getAll("apartments"),
    sheets.getAll("tenants")
  ]);

  const apartmentLabel = new Map<string, string>();
  for (const a of apartments as Row[]) {
    apartmentLabel.set(String(a.apartment_id), String(a.unit_label || a.apartment_id));
  }

  const tenantLabel = new Map<string, string>();
  for (const t of tenants as Row[]) {
    tenantLabel.set(String(t.tenant_id), String(t.full_name || t.tenant_id));
  }

  const rentApplied = new Map<string, number>();
  const billApplied = new Map<string, number>();

  for (const a of allocations as Row[]) {
    const amt = n(a.amount_applied);
    const rid = String(a.rent_id || "");
    const bid = String(a.bill_id || "");
    if (rid) rentApplied.set(rid, (rentApplied.get(rid) ?? 0) + amt);
    if (bid) billApplied.set(bid, (billApplied.get(bid) ?? 0) + amt);
  }

  const paymentOptions: PaymentOption[] = (payments as Row[])
    .filter((p) => String(p.verification_status).toLowerCase() === "verified")
    .map((p) => {
      const aptId = String(p.apartment_id || "");
      const tenId = String(p.tenant_id || "");
      const labelApt = apartmentLabel.get(aptId) ?? aptId;
      const labelTen = tenId ? (tenantLabel.get(tenId) ?? tenId) : "—";
      const amount = n(p.amount);

      return {
        id: String(p.payment_id),
        amount,
        verified: true,
        label: `Payment ${p.payment_id} | ₦${amount} | Apt ${labelApt} | Tenant ${labelTen} | ${p.payment_date || ""}`
      };
    });

  const rentOptions: ChargeOption[] = (rents as Row[])
    .map((r) => {
      const id = String(r.rent_id);
      const expected = n(r.expected_amount);
      const applied = rentApplied.get(id) ?? 0;
      const balance = expected - applied;
      return {
        id,
        kind: "rent" as const,
        expected,
        applied,
        balance,
        occupancyId: String(r.occupancy_id || ""),
        apartmentId: String(r.apartment_id || ""),
        label: `Rent ${id} | ₦${expected} | Bal ₦${balance} | Due ${r.due_date || ""}`
      };
    })
    .filter((x) => x.balance > 0.000001);

  const billOptions: ChargeOption[] = (bills as Row[])
    .map((b) => {
      const id = String(b.bill_id);
      const expected = n(b.expected_amount);
      const applied = billApplied.get(id) ?? 0;
      const balance = expected - applied;
      return {
        id,
        kind: "bill" as const,
        expected,
        applied,
        balance,
        occupancyId: String(b.occupancy_id || ""),
        apartmentId: String(b.apartment_id || ""),
        label: `Bill ${id} | ₦${expected} | Bal ₦${balance} | Due ${b.due_date || ""}`
      };
    })
    .filter((x) => x.balance > 0.000001);

  return { paymentOptions, rentOptions, billOptions };
}
