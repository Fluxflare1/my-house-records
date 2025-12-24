"use server";

import { getAdapters } from "@/lib/adapters";
import { requireAdmin } from "@/lib/auth/guards";

export type RefOption = { id: string; label: string };

function opt(id: any, label: any): RefOption {
  return { id: String(id ?? ""), label: String(label ?? "") };
}

export async function getReferenceData() {
  await requireAdmin();

  const { sheets } = getAdapters();

  const [properties, apartmentTypes, apartments, tenants, occupancies] =
    await Promise.all([
      sheets.getAll("properties"),
      sheets.getAll("apartmentTypes"),
      sheets.getAll("apartments"),
      sheets.getAll("tenants"),
      sheets.getAll("occupancies")
    ]);

  return {
    properties: properties
      .filter((p) => String(p.status).toLowerCase() !== "inactive")
      .map((p) => opt(p.property_id, `${p.name} (${p.property_id})`)),

    apartmentTypes: apartmentTypes
      .filter((t) => String(t.active).toLowerCase() !== "false")
      .map((t) =>
        opt(
          t.apartment_type_id,
          `${t.name} | Rent:${t.yearly_rent_amount} | Charges:${t.monthly_charge_amount}`
        )
      ),

    apartments: apartments
      .filter((a) => String(a.status).toLowerCase() !== "inactive")
      .map((a) => opt(a.apartment_id, `${a.unit_label} (${a.apartment_id})`)),

    tenants: tenants
      .filter((t) => String(t.status).toLowerCase() !== "inactive")
      .map((t) => opt(t.tenant_id, `${t.full_name} (${t.tenant_id})`)),

    activeOccupancies: occupancies
      .filter((o) => String(o.status).toLowerCase() === "active" && !o.end_date)
      .map((o) =>
        opt(
          o.occupancy_id,
          `Occ ${o.occupancy_id} | Apt ${o.apartment_id} | Tenant ${o.tenant_id}`
        )
      )
  };
}
