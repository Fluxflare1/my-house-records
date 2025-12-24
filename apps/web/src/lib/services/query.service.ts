import { getAdapters } from "../adapters";

export class QueryService {
  async getOccupanciesByTenant(tenantId: string) {
    const { sheets } = getAdapters();
    const rows = await sheets.getAll("occupancies");
    return rows.filter(o => o.tenant_id === tenantId);
  }

  async getRentsByOccupancy(occupancyIds: string[]) {
    const { sheets } = getAdapters();
    const rows = await sheets.getAll("rents");
    return rows.filter(r => occupancyIds.includes(r.occupancy_id));
  }

  async getBillsByOccupancy(occupancyIds: string[]) {
    const { sheets } = getAdapters();
    const rows = await sheets.getAll("bills");
    return rows.filter(b => occupancyIds.includes(b.occupancy_id));
  }

  async getPaymentsByTenant(tenantId: string) {
    const { sheets } = getAdapters();
    const rows = await sheets.getAll("payments");
    return rows.filter(p => p.tenant_id === tenantId);
  }
}
