import { getAdapters } from "../adapters";

export class LookupService {
  async getTenantById(tenantId: string) {
    const { sheets } = getAdapters();
    const tenants = await sheets.getAll("tenants");
    return tenants.find((t) => String(t.tenant_id) === tenantId) || null;
  }

  async getOccupancyById(occupancyId: string) {
    const { sheets } = getAdapters();
    const occs = await sheets.getAll("occupancies");
    return occs.find((o) => String(o.occupancy_id) === occupancyId) || null;
  }
}
