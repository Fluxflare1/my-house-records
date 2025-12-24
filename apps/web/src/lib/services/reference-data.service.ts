import { getAdapters } from "../adapters";

export type RefOption = { id: string; label: string };

export class ReferenceDataService {
  async properties(): Promise<RefOption[]> {
    const { sheets } = getAdapters();
    const rows = await sheets.getAll("properties");
    return rows
      .filter((r) => r.status !== "inactive")
      .map((r) => ({ id: String(r.property_id), label: String(r.name) }));
  }

  async apartmentTypes(): Promise<RefOption[]> {
    const { sheets } = getAdapters();
    const rows = await sheets.getAll("apartmentTypes");
    return rows
      .filter((r) => String(r.active) !== "false")
      .map((r) => ({
        id: String(r.apartment_type_id),
        label: `${r.name} (Rent: ${r.yearly_rent_amount}, Charges: ${r.monthly_charge_amount})`,
      }));
  }

  async apartments(): Promise<RefOption[]> {
    const { sheets } = getAdapters();
    const rows = await sheets.getAll("apartments");
    return rows
      .filter((r) => r.status !== "inactive")
      .map((r) => ({ id: String(r.apartment_id), label: String(r.unit_label) }));
  }

  async tenants(): Promise<RefOption[]> {
    const { sheets } = getAdapters();
    const rows = await sheets.getAll("tenants");
    return rows
      .filter((r) => r.status !== "inactive")
      .map((r) => ({ id: String(r.tenant_id), label: String(r.full_name) }));
  }

  async activeOccupancies(): Promise<RefOption[]> {
    const { sheets } = getAdapters();
    const rows = await sheets.getAll("occupancies");
    return rows
      .filter((r) => r.status === "active" && !r.end_date)
      .map((r) => ({
        id: String(r.occupancy_id),
        label: `Occ ${r.occupancy_id} (Apt ${r.apartment_id}, Tenant ${r.tenant_id})`,
      }));
  }
}
