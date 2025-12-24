"use server";

import { getAdapters } from "@/lib/adapters";

function sum(n: number[]) {
  return n.reduce((a, b) => a + b, 0);
}

export async function getApartmentStatement(apartmentId: string) {
  const { sheets } = getAdapters();

  const rents = (await sheets.getAll("rents")).filter((r) => String(r.apartment_id) === apartmentId);
  const bills = (await sheets.getAll("bills")).filter((b) => String(b.apartment_id) === apartmentId);
  const allocations = await sheets.getAll("allocations");

  const rentAppliedMap = new Map<string, number>();
  const billAppliedMap = new Map<string, number>();

  for (const a of allocations) {
    const rentId = String(a.rent_id ?? "");
    const billId = String(a.bill_id ?? "");
    const amt = Number(a.amount_applied ?? 0);

    if (rentId) rentAppliedMap.set(rentId, (rentAppliedMap.get(rentId) ?? 0) + amt);
    if (billId) billAppliedMap.set(billId, (billAppliedMap.get(billId) ?? 0) + amt);
  }

  const rentRows = rents.map((r) => {
    const expected = Number(r.expected_amount ?? 0);
    const applied = rentAppliedMap.get(String(r.rent_id)) ?? 0;
    return { ...r, expected, applied, balance: expected - applied };
  });

  const billRows = bills.map((b) => {
    const expected = Number(b.expected_amount ?? 0);
    const applied = billAppliedMap.get(String(b.bill_id)) ?? 0;
    return { ...b, expected, applied, balance: expected - applied };
  });

  return {
    apartmentId,
    rent: {
      rows: rentRows,
      summary: {
        expected: sum(rentRows.map((x) => x.expected)),
        applied: sum(rentRows.map((x) => x.applied)),
        balance: sum(rentRows.map((x) => x.balance))
      }
    },
    bills: {
      rows: billRows,
      summary: {
        expected: sum(billRows.map((x) => x.expected)),
        applied: sum(billRows.map((x) => x.applied)),
        balance: sum(billRows.map((x) => x.balance))
      }
    }
  };
}

export async function getTenantStatement(tenantId: string) {
  const { sheets } = getAdapters();

  const occupancies = (await sheets.getAll("occupancies")).filter((o) => String(o.tenant_id) === tenantId);
  const occIds = new Set(occupancies.map((o) => String(o.occupancy_id)));

  const rents = (await sheets.getAll("rents")).filter((r) => occIds.has(String(r.occupancy_id)));
  const bills = (await sheets.getAll("bills")).filter((b) => occIds.has(String(b.occupancy_id)));
  const allocations = await sheets.getAll("allocations");

  const rentAppliedMap = new Map<string, number>();
  const billAppliedMap = new Map<string, number>();

  for (const a of allocations) {
    const rentId = String(a.rent_id ?? "");
    const billId = String(a.bill_id ?? "");
    const amt = Number(a.amount_applied ?? 0);

    if (rentId) rentAppliedMap.set(rentId, (rentAppliedMap.get(rentId) ?? 0) + amt);
    if (billId) billAppliedMap.set(billId, (billAppliedMap.get(billId) ?? 0) + amt);
  }

  const rentRows = rents.map((r) => {
    const expected = Number(r.expected_amount ?? 0);
    const applied = rentAppliedMap.get(String(r.rent_id)) ?? 0;
    return { ...r, expected, applied, balance: expected - applied };
  });

  const billRows = bills.map((b) => {
    const expected = Number(b.expected_amount ?? 0);
    const applied = billAppliedMap.get(String(b.bill_id)) ?? 0;
    return { ...b, expected, applied, balance: expected - applied };
  });

  return {
    tenantId,
    occupancies,
    rent: {
      rows: rentRows,
      summary: {
        expected: sum(rentRows.map((x) => x.expected)),
        applied: sum(rentRows.map((x) => x.applied)),
        balance: sum(rentRows.map((x) => x.balance))
      }
    },
    bills: {
      rows: billRows,
      summary: {
        expected: sum(billRows.map((x) => x.expected)),
        applied: sum(billRows.map((x) => x.applied)),
        balance: sum(billRows.map((x) => x.balance))
      }
    }
  };
}
