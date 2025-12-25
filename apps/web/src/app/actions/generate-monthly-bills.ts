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

function monthStartEnd(ym: string) {
  // ym = YYYY-MM
  const [Y, M] = ym.split("-").map((x) => Number(x));
  if (!Y || !M || M < 1 || M > 12) throw new Error("Invalid billing month. Use YYYY-MM.");
  const start = new Date(Date.UTC(Y, M - 1, 1));
  const end = new Date(Date.UTC(Y, M, 0)); // last day of month
  const fmt = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  return { startDate: fmt(start), endDate: fmt(end) };
}

function addDays(ymd: string, days: number) {
  const d = new Date(ymd + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function isActiveOcc(o: Row) {
  return s(o.status).toLowerCase() === "active" && !s(o.end_date);
}

/**
 * Creates ONE bill per active occupancy per month.
 * Bill amount is derived from apartment type monthly_charge_amount.
 * No duplicates: checks existing bills for same occupancy_id + billing_month.
 */
export async function generateMonthlyBills(input: {
  billingMonth: string; // "YYYY-MM"
  billName?: string; // default "Monthly Charges"
  dueInDays?: number; // default 7
}) {
  await requireAdminPermission(PERMS.MANAGE_BILLS);

  const billingMonth = s(input.billingMonth);
  const billName = s(input.billName) || "Monthly Charges";
  const dueInDays = Number.isFinite(Number(input.dueInDays)) ? Number(input.dueInDays) : 7;

  const { startDate, endDate } = monthStartEnd(billingMonth);
  const dueDate = addDays(startDate, Math.max(0, dueInDays));

  const { sheets } = getAdapters();

  const [occupancies, apartments, apartmentTypes, bills] = await Promise.all([
    sheets.getAll("occupancies"),
    sheets.getAll("apartments"),
    sheets.getAll("apartmentTypes"),
    sheets.getAll("bills")
  ]);

  const activeOccs = (occupancies as Row[]).filter(isActiveOcc);

  // Map apartment -> type
  const aptToType = new Map<string, string>();
  for (const a of apartments as Row[]) {
    const aptId = s(a.apartment_id);
    if (!aptId) continue;
    aptToType.set(aptId, s(a.apartment_type_id));
  }

  // Map type -> monthly charge
  const typeMonthly = new Map<string, number>();
  for (const t of apartmentTypes as Row[]) {
    const tid = s(t.apartment_type_id);
    if (!tid) continue;
    typeMonthly.set(tid, n(t.monthly_charge_amount));
  }

  // Existing bill keys: occupancy_id + billing_month
  const existingKey = new Set<string>();
  for (const b of bills as Row[]) {
    const occId = s(b.occupancy_id);
    const bm = s(b.billing_month);
    if (occId && bm) existingKey.add(`${occId}::${bm}`);
  }

  let created = 0;
  let skipped = 0;
  const createdIds: string[] = [];
  const skippedOccIds: string[] = [];

  for (const o of activeOccs) {
    const occId = s(o.occupancy_id);
    const aptId = s(o.apartment_id);
    if (!occId || !aptId) continue;

    const key = `${occId}::${billingMonth}`;
    if (existingKey.has(key)) {
      skipped++;
      skippedOccIds.push(occId);
      continue;
    }

    const typeId = aptToType.get(aptId) || "";
    const amount = typeMonthly.get(typeId) ?? 0;

    // You may allow zero; but usually should not create. We'll block:
    if (amount <= 0) {
      skipped++;
      skippedOccIds.push(occId);
      continue;
    }

    const row = {
      bill_id: generateId("bill"),
      occupancy_id: occId,
      bill_name: billName,
      billing_month: billingMonth,
      period_start: startDate,
      period_end: endDate,
      due_date: dueDate,
      expected_amount: amount,
      status: "open",
      created_at: nowISO()
    };

    await sheets.appendRow("bills", Object.values(row));
    existingKey.add(key);
    created++;
    createdIds.push(row.bill_id);
  }

  return {
    ok: true,
    billingMonth,
    created,
    skipped,
    createdBillIds: createdIds,
    skippedOccupancyIds: skippedOccIds,
    meta: { period_start: startDate, period_end: endDate, due_date: dueDate, bill_name: billName }
  };
}
