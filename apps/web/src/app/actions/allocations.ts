"use server";

import { getAdapters } from "@/lib/adapters";
import { requireAdminPermission } from "@/lib/auth/guards";
import { PERMS } from "@/lib/auth/permissions";
import { generateId } from "@/lib/utils/id";
import { nowISO } from "@/lib/utils/time";

type Row = Record<string, any>;
const s = (v: any) => String(v ?? "").trim();
const n = (v: any) => {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
};

type DebtItem = {
  kind: "rent" | "bill";
  id: string; // rent_id or bill_id
  occupancyId: string;
  dueDate: string;
  label: string;
  expected: number;
  applied: number;
  balance: number;
};

type Suggestion = {
  paymentId: string;
  apartmentId: string;
  paymentAmount: number;
  alreadyAllocated: number;
  availableToAllocate: number;
  strategy: "oldest_due_first";
  suggestions: Array<{
    kind: "rent" | "bill";
    targetId: string;
    occupancyId: string;
    dueDate: string;
    label: string;
    amount: number;
  }>;
};

function isActiveOcc(o: Row) {
  return s(o.status).toLowerCase() === "active" && !s(o.end_date);
}

function sortByDateAsc(a: string, b: string) {
  return s(a).localeCompare(s(b));
}

export async function getPaymentContext(paymentId: string) {
  await requireAdminPermission(PERMS.MANAGE_ALLOCATIONS);

  const { sheets } = getAdapters();
  const [payments, allocations] = await Promise.all([sheets.getAll("payments"), sheets.getAll("allocations")]);

  const pay = (payments as Row[]).find((p) => s(p.payment_id) === s(paymentId));
  if (!pay) throw new Error("Payment not found");

  const totalAlloc = (allocations as Row[])
    .filter((a) => s(a.payment_id) === s(paymentId))
    .reduce((sum, a) => sum + n(a.amount_applied), 0);

  return {
    paymentId: s(pay.payment_id),
    apartmentId: s(pay.apartment_id),
    tenantId: s(pay.tenant_id),
    paymentDate: s(pay.payment_date),
    amount: n(pay.amount),
    verificationStatus: s(pay.verification_status || "pending"),
    alreadyAllocated: totalAlloc
  };
}

/**
 * Suggest allocations for a payment:
 * - Strategy: oldest due first (rent + bills)
 * - Scope: debts tied to occupancies for the payment's apartment (history included)
 * - Uses allocations table to compute balances
 */
export async function suggestAllocationsForPayment(input: { paymentId: string }): Promise<Suggestion> {
  await requireAdminPermission(PERMS.MANAGE_ALLOCATIONS);

  const paymentId = s(input.paymentId);
  if (!paymentId) throw new Error("paymentId is required");

  const { sheets } = getAdapters();

  const [payments, occupancies, rents, bills, allocations, apartments, tenants] = await Promise.all([
    sheets.getAll("payments"),
    sheets.getAll("occupancies"),
    sheets.getAll("rents"),
    sheets.getAll("bills"),
    sheets.getAll("allocations"),
    sheets.getAll("apartments"),
    sheets.getAll("tenants")
  ]);

  const pay = (payments as Row[]).find((p) => s(p.payment_id) === paymentId);
  if (!pay) throw new Error("Payment not found");

  const apartmentId = s(pay.apartment_id);
  if (!apartmentId) throw new Error("Payment has no apartment_id");

  // Occupancies for that apartment (history)
  const occForApt = (occupancies as Row[])
    .filter((o) => s(o.apartment_id) === apartmentId)
    .slice()
    .sort((a, b) => sortByDateAsc(s(a.start_date), s(b.start_date)));

  const occIds = new Set(occForApt.map((o) => s(o.occupancy_id)).filter(Boolean));
  if (occIds.size === 0) {
    return {
      paymentId,
      apartmentId,
      paymentAmount: n(pay.amount),
      alreadyAllocated: 0,
      availableToAllocate: n(pay.amount),
      strategy: "oldest_due_first",
      suggestions: []
    };
  }

  // Applied amounts maps
  const rentApplied = new Map<string, number>();
  const billApplied = new Map<string, number>();
  const paymentAllocAlready = (allocations as Row[])
    .filter((a) => s(a.payment_id) === paymentId)
    .reduce((sum, a) => sum + n(a.amount_applied), 0);

  for (const a of allocations as Row[]) {
    const amt = n(a.amount_applied);
    const rid = s(a.rent_id);
    const bid = s(a.bill_id);
    if (rid) rentApplied.set(rid, (rentApplied.get(rid) ?? 0) + amt);
    if (bid) billApplied.set(bid, (billApplied.get(bid) ?? 0) + amt);
  }

  // Labels (tenant + apt)
  const apt = (apartments as Row[]).find((a) => s(a.apartment_id) === apartmentId);
  const aptLabel = s(apt?.unit_label || apartmentId);

  const tenantName = new Map<string, string>();
  for (const t of tenants as Row[]) tenantName.set(s(t.tenant_id), s(t.full_name || t.tenant_id));

  const occTenant = new Map<string, string>();
  for (const o of occForApt) occTenant.set(s(o.occupancy_id), s(o.tenant_id));

  // Build debt items
  const debt: DebtItem[] = [];

  for (const r of rents as Row[]) {
    const occId = s(r.occupancy_id);
    if (!occIds.has(occId)) continue;

    const expected = n(r.expected_amount);
    const applied = rentApplied.get(s(r.rent_id)) ?? 0;
    const balance = expected - applied;

    if (balance <= 0.000001) continue;

    const tId = occTenant.get(occId) || "";
    const tName = tenantName.get(tId) || tId || "—";
    const dueDate = s(r.due_date || r.period_start || "");

    debt.push({
      kind: "rent",
      id: s(r.rent_id),
      occupancyId: occId,
      dueDate,
      label: `Rent | ${aptLabel} | ${tName} | Period ${s(r.period_start)} → ${s(r.period_end)}`,
      expected,
      applied,
      balance
    });
  }

  for (const b of bills as Row[]) {
    const occId = s(b.occupancy_id);
    if (!occIds.has(occId)) continue;

    const expected = n(b.expected_amount);
    const applied = billApplied.get(s(b.bill_id)) ?? 0;
    const balance = expected - applied;

    if (balance <= 0.000001) continue;

    const tId = occTenant.get(occId) || "";
    const tName = tenantName.get(tId) || tId || "—";
    const dueDate = s(b.due_date || b.period_start || "");

    debt.push({
      kind: "bill",
      id: s(b.bill_id),
      occupancyId: occId,
      dueDate,
      label: `Bill | ${s(b.bill_name) || "Charges"} | ${aptLabel} | ${tName} | ${s(b.billing_month) || ""}`,
      expected,
      applied,
      balance
    });
  }

  // Sort oldest first
  debt.sort((a, b) => sortByDateAsc(a.dueDate, b.dueDate));

  const paymentAmount = n(pay.amount);
  const available = Math.max(0, paymentAmount - paymentAllocAlready);

  let remaining = available;
  const suggestions: Suggestion["suggestions"] = [];

  for (const d of debt) {
    if (remaining <= 0.000001) break;
    const amt = Math.min(remaining, Math.max(0, d.balance));
    if (amt <= 0.000001) continue;

    suggestions.push({
      kind: d.kind,
      targetId: d.id,
      occupancyId: d.occupancyId,
      dueDate: d.dueDate,
      label: d.label,
      amount: amt
    });

    remaining -= amt;
  }

  return {
    paymentId,
    apartmentId,
    paymentAmount,
    alreadyAllocated: paymentAllocAlready,
    availableToAllocate: available,
    strategy: "oldest_due_first",
    suggestions
  };
}

export async function applyAllocations(input: {
  paymentId: string;
  items: Array<{ kind: "rent" | "bill"; targetId: string; amount: number }>;
}) {
  await requireAdminPermission(PERMS.MANAGE_ALLOCATIONS);

  const paymentId = s(input.paymentId);
  if (!paymentId) throw new Error("paymentId is required");
  if (!Array.isArray(input.items) || input.items.length === 0) throw new Error("No allocations provided");

  const { sheets } = getAdapters();
  const [payments, allocations] = await Promise.all([sheets.getAll("payments"), sheets.getAll("allocations")]);

  const pay = (payments as Row[]).find((p) => s(p.payment_id) === paymentId);
  if (!pay) throw new Error("Payment not found");

  const paymentAmount = n(pay.amount);
  const alreadyAllocated = (allocations as Row[])
    .filter((a) => s(a.payment_id) === paymentId)
    .reduce((sum, a) => sum + n(a.amount_applied), 0);

  const available = Math.max(0, paymentAmount - alreadyAllocated);

  const totalNew = input.items.reduce((sum, it) => sum + n(it.amount), 0);
  if (totalNew <= 0) throw new Error("Allocation amount must be > 0");
  if (totalNew - available > 0.000001) {
    throw new Error(`Allocation exceeds available payment amount. Available: ${available}`);
  }

  for (const it of input.items) {
    const kind = it.kind;
    const targetId = s(it.targetId);
    const amt = n(it.amount);
    if (!targetId) throw new Error("Missing targetId");
    if (amt <= 0) throw new Error("Allocation amount must be > 0");

    const row: Row = {
      allocation_id: generateId("alloc"),
      payment_id: paymentId,
      rent_id: kind === "rent" ? targetId : "",
      bill_id: kind === "bill" ? targetId : "",
      amount_applied: amt,
      created_at: nowISO()
    };

    await sheets.appendRow("allocations", Object.values(row));
  }

  return { ok: true, paymentId, added: input.items.length };
}
