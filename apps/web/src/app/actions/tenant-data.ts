"use server";

import { QueryService } from "@/lib/services/query.service";

export async function getTenantDashboardData(tenantId: string) {
  const qs = new QueryService();
  const occupancies = await qs.getOccupanciesByTenant(tenantId);
  const occIds = occupancies.map(o => o.occupancy_id);

  return {
    occupancies,
    rents: await qs.getRentsByOccupancy(occIds),
    bills: await qs.getBillsByOccupancy(occIds),
    payments: await qs.getPaymentsByTenant(tenantId)
  };
}
