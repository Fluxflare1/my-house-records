"use server";

import { getAdapters } from "@/lib/adapters";
import { requireAdminPermission, requireTenant } from "@/lib/auth/guards";
import { PERMS } from "@/lib/auth/permissions";

type Row = Record<string, any>;
const s = (v: any) => String(v ?? "").trim();
const n = (v: any) => {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
};

function sortAsc(a: string, b: string) {
  return s(a).localeCompare(s(b));
}

function sortDesc(a: string, b: string) {
  return s(b).localeCompare(s(a));
}

type StatementDebt = {
  kind: "rent" | "bill";
  id: string;
  label: string;
  dueDate: string;
  expected: number;
  applied: number;
  balance: number;
};

type OccupancyBlock = {
  occupancyId: string;
  tenantId: string;
  tenantName: string;
  apartmentId: string;
  apartmentLabel: string;
  startDate: string;
  endDate: string;
  status: string;
  rent: StatementDebt[];
  bills: StatementDebt[];
  totals: {
    rentExpected: number;
    rentApplied: number;
    rentBalance: number;
    billExpected: number;
    billApplied: number;
    billBalance: number;
    totalBalance: number;
  };
};

function computeAppliedMaps(allocations: Row[]) {
  const rentApplied = new Map<string, number>();
  const billApplied = new Map<string, number>();

  for (const a of allocations) {
    const amt = n(a.amount_applied);
    const rid = s(a.rent_id);
    const bid = s(a.bill_id);
    if (rid) rentApplied.set(rid, (rentApplied.get(rid) ?? 0) + amt);
    if (bid) billApplied.set(bid, (billApplied.get(bid) ?? 0) + amt);
  }

  return { rentApplied, billApplied };
}

export async function getAdminApartmentStatement(input: { apartmentId: string }) {
  await requireAdminPermission(PERMS.VIEW_STATEMENTS);

  const apartmentId = s(input.apartmentId);
  if (!apartmentId) throw new Error("apartmentId is required");

  const { sheets } = getAdapters();
  const [occupancies, apartments, tenants, rents, bills, allocations] = await Promise.all([
    sheets.getAll("occupancies"),
    sheets.getAll("apartments"),
    sheets.getAll("tenants"),
    sheets.getAll("rents"),
    sheets.getAll("bills"),
    sheets.getAll("allocations")
  ]);

  const apt = (apartments as Row[]).find((a) => s(a.apartment_id) === apartmentId);
  const apartmentLabel = s(apt?.unit_label || apartmentId);

  const tenantName = new Map<string, string>();
  for (const t of tenants as Row[]) tenantName.set(s(t.tenant_id), s(t.full_name || t.tenant_id));

  const occs = (occupancies as Row[])
    .filter((o) => s(o.apartment_id) === apartmentId)
    .slice()
    .sort((a, b) => sortAsc(s(a.start_date), s(b.start_date)));

  const { rentApplied, billApplied } = computeAppliedMaps(allocations as Row[]);

  const byOccRent = new Map<string, Row[]>();
  for (const r of rents as Row[]) {
    const occId = s(r.occupancy_id);
    if (!occId) continue;
    byOccRent.set(occId, [...(byOccRent.get(occId) ?? []), r]);
  }

  const byOccBill = new Map<string, Row[]>();
  for (const b of bills as Row[]) {
    const occId = s(b.occupancy_id);
    if (!occId) continue;
    byOccBill.set(occId, [...(byOccBill.get(occId) ?? []), b]);
  }

  const blocks: OccupancyBlock[] = occs.map((o) => {
    const occupancyId = s(o.occupancy_id);
    const tenantId = s(o.tenant_id);
    const tenant = tenantName.get(tenantId) ?? tenantId ?? "—";

    const rr = (byOccRent.get(occupancyId) ?? []).slice().sort((a, b) => sortAsc(s(a.due_date), s(b.due_date)));
    const bb = (byOccBill.get(occupancyId) ?? []).slice().sort((a, b) => sortAsc(s(a.due_date), s(b.due_date)));

    const rentDebts: StatementDebt[] = rr.map((r) => {
      const expected = n(r.expected_amount);
      const applied = rentApplied.get(s(r.rent_id)) ?? 0;
      const balance = expected - applied;
      return {
        kind: "rent",
        id: s(r.rent_id),
        label: `Period ${s(r.period_start)} → ${s(r.period_end)}`,
        dueDate: s(r.due_date || r.period_start || ""),
        expected,
        applied,
        balance
      };
    });

    const billDebts: StatementDebt[] = bb.map((b) => {
      const expected = n(b.expected_amount);
      const applied = billApplied.get(s(b.bill_id)) ?? 0;
      const balance = expected - applied;
      return {
        kind: "bill",
        id: s(b.bill_id),
        label: `${s(b.bill_name) || "Charges"} (${s(b.billing_month) || ""})`,
        dueDate: s(b.due_date || b.period_start || ""),
        expected,
        applied,
        balance
      };
    });

    const rentExpected = rentDebts.reduce((sum, x) => sum + n(x.expected), 0);
    const rentAppliedSum = rentDebts.reduce((sum, x) => sum + n(x.applied), 0);
    const rentBalance = Math.max(0, rentDebts.reduce((sum, x) => sum + Math.max(0, n(x.balance)), 0));

    const billExpected = billDebts.reduce((sum, x) => sum + n(x.expected), 0);
    const billAppliedSum = billDebts.reduce((sum, x) => sum + n(x.applied), 0);
    const billBalance = Math.max(0, billDebts.reduce((sum, x) => sum + Math.max(0, n(x.balance)), 0));

    return {
      occupancyId,
      tenantId,
      tenantName: tenant,
      apartmentId,
      apartmentLabel,
      startDate: s(o.start_date),
      endDate: s(o.end_date),
      status: s(o.status) || (s(o.end_date) ? "ended" : "active"),
      rent: rentDebts,
      bills: billDebts,
      totals: {
        rentExpected,
        rentApplied: rentAppliedSum,
        rentBalance,
        billExpected,
        billApplied: billAppliedSum,
        billBalance,
        totalBalance: rentBalance + billBalance
      }
    };
  });

  const grand = blocks.reduce(
    (acc, b) => {
      acc.rentBalance += b.totals.rentBalance;
      acc.billBalance += b.totals.billBalance;
      acc.totalBalance += b.totals.totalBalance;
      return acc;
    },
    { rentBalance: 0, billBalance: 0, totalBalance: 0 }
  );

  return {
    apartmentId,
    apartmentLabel,
    blocks,
    grandTotals: grand
  };
}

export async function getTenantStatement() {
  const tenantSession = await requireTenant();
  const tenantId = s(tenantSession.tenantId);

  const { sheets } = getAdapters();
  const [occupancies, apartments, tenants, rents, bills, allocations] = await Promise.all([
    sheets.getAll("occupancies"),
    sheets.getAll("apartments"),
    sheets.getAll("tenants"),
    sheets.getAll("rents"),
    sheets.getAll("bills"),
    sheets.getAll("allocations")
  ]);

  const tenant = (tenants as Row[]).find((t) => s(t.tenant_id) === tenantId);
  const tenantName = s(tenant?.full_name || tenantId);

  const aptLabel = new Map<string, string>();
  for (const a of apartments as Row[]) aptLabel.set(s(a.apartment_id), s(a.unit_label || a.apartment_id));

  const occs = (occupancies as Row[])
    .filter((o) => s(o.tenant_id) === tenantId)
    .slice()
    .sort((a, b) => sortDesc(s(a.start_date), s(b.start_date)));

  const { rentApplied, billApplied } = computeAppliedMaps(allocations as Row[]);

  const byOccRent = new Map<string, Row[]>();
  for (const r of rents as Row[]) {
    const occId = s(r.occupancy_id);
    if (!occId) continue;
    byOccRent.set(occId, [...(byOccRent.get(occId) ?? []), r]);
  }

  const byOccBill = new Map<string, Row[]>();
  for (const b of bills as Row[]) {
    const occId = s(b.occupancy_id);
    if (!occId) continue;
    byOccBill.set(occId, [...(byOccBill.get(occId) ?? []), b]);
  }

  const blocks: OccupancyBlock[] = occs.map((o) => {
    const occupancyId = s(o.occupancy_id);
    const apartmentId = s(o.apartment_id);
    const apartmentLabel = aptLabel.get(apartmentId) ?? apartmentId;

    const rr = (byOccRent.get(occupancyId) ?? []).slice().sort((a, b) => sortAsc(s(a.due_date), s(b.due_date)));
    const bb = (byOccBill.get(occupancyId) ?? []).slice().sort((a, b) => sortAsc(s(a.due_date), s(b.due_date)));

    const rentDebts: StatementDebt[] = rr.map((r) => {
      const expected = n(r.expected_amount);
      const applied = rentApplied.get(s(r.rent_id)) ?? 0;
      const balance = expected - applied;
      return {
        kind: "rent",
        id: s(r.rent_id),
        label: `Period ${s(r.period_start)} → ${s(r.period_end)}`,
        dueDate: s(r.due_date || r.period_start || ""),
        expected,
        applied,
        balance
      };
    });

    const billDebts: StatementDebt[] = bb.map((b) => {
      const expected = n(b.expected_amount);
      const applied = billApplied.get(s(b.bill_id)) ?? 0;
      const balance = expected - applied;
      return {
        kind: "bill",
        id: s(b.bill_id),
        label: `${s(b.bill_name) || "Charges"} (${s(b.billing_month) || ""})`,
        dueDate: s(b.due_date || b.period_start || ""),
        expected,
        applied,
        balance
      };
    });

    const rentBalance = Math.max(0, rentDebts.reduce((sum, x) => sum + Math.max(0, n(x.balance)), 0));
    const billBalance = Math.max(0, billDebts.reduce((sum, x) => sum + Math.max(0, n(x.balance)), 0));

    return {
      occupancyId,
      tenantId,
      tenantName,
      apartmentId,
      apartmentLabel,
      startDate: s(o.start_date),
      endDate: s(o.end_date),
      status: s(o.status) || (s(o.end_date) ? "ended" : "active"),
      rent: rentDebts,
      bills: billDebts,
      totals: {
        rentExpected: rentDebts.reduce((sum, x) => sum + n(x.expected), 0),
        rentApplied: rentDebts.reduce((sum, x) => sum + n(x.applied), 0),
        rentBalance,
        billExpected: billDebts.reduce((sum, x) => sum + n(x.expected), 0),
        billApplied: billDebts.reduce((sum, x) => sum + n(x.applied), 0),
        billBalance,
        totalBalance: rentBalance + billBalance
      }
    };
  });

  const grand = blocks.reduce(
    (acc, b) => {
      acc.rentBalance += b.totals.rentBalance;
      acc.billBalance += b.totals.billBalance;
      acc.totalBalance += b.totals.totalBalance;
      return acc;
    },
    { rentBalance: 0, billBalance: 0, totalBalance: 0 }
  );

  return { tenantId, tenantName, blocks, grandTotals: grand };
}
