import { getAdapters } from "../adapters";
import { Tenant } from "../types/tenant";

export class TenantService {
  async create(tenant: Tenant) {
    const { sheets } = getAdapters();
    await sheets.appendRow("tenants", Object.values(tenant));
  }
}
