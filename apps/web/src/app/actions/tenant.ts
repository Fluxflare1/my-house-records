"use server";

import { getAdapters } from "@/lib/adapters";

export async function getTenantDashboard(tenantId: string) {
  const { sheets } = getAdapters();

  const occupancies = (await sheets.getAll("occupancies")).filter(
    (o) => String(o.tenant_id) === String(tenantId)
  );

  const occIds = new Set(occupancies.map((o) => String(o.occupancy_id)));

  const rents = (await sheets.getAll("rents")).filter((r) =>
    occIds.has(String(r.occupancy_id))
  );

  const bills = (await sheets.getAll("bills")).filter((b) =>
    occIds.has(String(b.occupancy_id))
  );

  const payments = (await sheets.getAll("payments")).filter(
    (p) => String(p.tenant_id) === String(tenantId)
  );

  const allocations = await sheets.getAll("allocations");

  return { tenantId, occupancies, rents, bills, payments, allocations };
}
