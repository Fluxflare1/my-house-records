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

function isActiveOcc(o: Row) {
  return s(o.status).toLowerCase() === "active" && !s(o.end_date);
}

function ymd(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function addYearsMinusOneDay(startYMD: string, years: number) {
  const d = new Date(startYMD + "T00:00:00Z");
  const end = new Date(Date.UTC(d.getUTCFullYear() + years, d.getUTCMonth(), d.getUTCDate()));
  end.setUTCDate(end.getUTCDate() - 1);
  return ymd(end);
}

function within(y: string, start: string, end: string) {
  return y >= start && y <= end;
}

/**
 * Creates rent record per active occupancy for a rent period:
 * period_start = occupancy.start_date (or anniversary)
 * period_end = period_start + 1 year - 1 day
 *
 * Default behavior:
 * - Create CURRENT rent period if not already existing.
 * - No duplicates: checks existing rents where occupancy_id + period_start match.
 */
export async function generateCurrentYearlyRentForActiveOccupancies(input?: {
  dueInDays?: number; // default 0 (due on start day)
}) {
  await requireAdminPermission(PERMS.MANAGE_RENT);

  const dueInDays = Number.isFinite(Number(input?.dueInDays)) ? Number(input?.dueInDays) : 0;

  const { sheets } = getAdapters();

  const [occupancies, apartments, apartmentTypes, rents] = await Promise.all([
    sheets.getAll("occupancies"),
    sheets.getAll("apartments"),
    sheets.getAll("apartmentTypes"),
    sheets.getAll("rents")
  ]);

  const activeOccs = (occupancies as Row[]).filter(isActiveOcc);

  // Map apartment -> type
  const aptToType = new Map<string, string>();
  for (const a of apartments as Row[]) {
    const aptId = s(a.apartment_id);
    if (!aptId) continue;
    aptToType.set(aptId, s(a.apartment_type_id));
  }

  // Map type -> yearly rent amount
  const typeYearly = new Map<string, number>();
  for (const t of apartmentTypes as Row[]) {
    const tid = s(t.apartment_type_id);
    if (!tid) continue;
    typeYearly.set(tid, n(t.yearly_rent_amount));
  }

  // Existing key: occupancy_id + period_start
  const existing = new Set<string>();
  for (const r of rents as Row[]) {
    const occId = s(r.occupancy_id);
    const ps = s(r.period_start);
    if (occId && ps) existing.add(`${occId}::${ps}`);
  }

  const today = ymd(new Date());

  let created = 0;
  let skipped = 0;
  const createdIds: string[] = [];

  for (const o of activeOccs) {
    const occId = s(o.occupancy_id);
    const aptId = s(o.apartment_id);
    const start = s(o.start_date);

    if (!occId || !aptId || !start) {
      skipped++;
      continue;
    }

    // Determine current rent period start:
    // - Use occupancy start date anniversary aligned to "today".
    const startDate = new Date(start + "T00:00:00Z");
    let periodStart = start;

    // Move periodStart forward in 1-year increments until it covers today
    // (e.g., tenant has stayed > 1 year).
    while (true) {
      const periodEnd = addYearsMinusOneDay(periodStart, 1);
      if (within(today, periodStart, periodEnd)) break;
      // advance 1 year
      const d = new Date(periodStart + "T00:00:00Z");
      const next = new Date(Date.UTC(d.getUTCFullYear() + 1, d.getUTCMonth(), d.getUTCDate()));
      periodStart = ymd(next);
      // safety stop
      if (new Date(periodStart + "T00:00:00Z").getUTCFullYear() - startDate.getUTCFullYear() > 20) break;
    }

    const key = `${occId}::${periodStart}`;
    if (existing.has(key)) {
      skipped++;
      continue;
    }

    const typeId = aptToType.get(aptId) || "";
    const amount = typeYearly.get(typeId) ?? 0;
    if (amount <= 0) {
      skipped++;
      continue;
    }

    const periodEnd = addYearsMinusOneDay(periodStart, 1);

    // due_date default = period_start (+ dueInDays)
    const due = (() => {
      const d = new Date(periodStart + "T00:00:00Z");
      d.setUTCDate(d.getUTCDate() + Math.max(0, dueInDays));
      return ymd(d);
    })();

    const row = {
      rent_id: generateId("rent"),
      occupancy_id: occId,
      period_start: periodStart,
      period_end: periodEnd,
      due_date: due,
      expected_amount: amount,
      status: "open",
      created_at: nowISO()
    };

    await sheets.appendRow("rents", Object.values(row));
    existing.add(key);
    created++;
    createdIds.push(row.rent_id);
  }

  return { ok: true, created, skipped, createdRentIds: createdIds };
}
