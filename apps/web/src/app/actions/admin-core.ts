"use server";

import { getAdapters } from "@/lib/adapters";
import { generateId } from "@/lib/utils/id";
import { nowISO } from "@/lib/utils/time";

/**
 * IMPORTANT:
 * - All writes happen here (server-only).
 * - UI will call these actions later.
 * - Rent is NOT a bill (separate actions/tables below).
 */

export async function createProperty(input: { name: string; address: string }) {
  const { sheets } = getAdapters();
  const row = {
    property_id: generateId("property"),
    name: input.name,
    address: input.address,
    status: "active",
    created_at: nowISO()
  };
  await sheets.appendRow("properties", Object.values(row));
  return row;
}

export async function createApartmentType(input: {
  name: string;
  yearlyRentAmount: number;
  monthlyChargeAmount: number;
}) {
  const { sheets } = getAdapters();
  const row = {
    apartment_type_id: generateId("apt_type"),
    name: input.name,
    yearly_rent_amount: input.yearlyRentAmount,
    monthly_charge_amount: input.monthlyChargeAmount,
    active: true,
    created_at: nowISO()
  };
  await sheets.appendRow("apartmentTypes", Object.values(row));
  return row;
}

export async function createApartment(input: {
  propertyId: string;
  apartmentTypeId: string;
  unitLabel: string;
}) {
  const { sheets } = getAdapters();
  const row = {
    apartment_id: generateId("apt"),
    property_id: input.propertyId,
    apartment_type_id: input.apartmentTypeId,
    unit_label: input.unitLabel,
    status: "vacant",
    created_at: nowISO()
  };
  await sheets.appendRow("apartments", Object.values(row));
  return row;
}

export async function createTenant(input: {
  fullName: string;
  phone: string;
  email?: string;
}) {
  const { sheets } = getAdapters();
  const row = {
    tenant_id: generateId("tenant"),
    full_name: input.fullName,
    phone: input.phone,
    email: input.email ?? "",
    status: "active",
    created_at: nowISO()
  };
  await sheets.appendRow("tenants", Object.values(row));
  return row;
}

/**
 * Bond tenant to apartment = create occupancy.
 * NOTE: overlap validation will be enforced as a rule (Action 6) using getAll("occupancies").
 */
export async function bondOccupancy(input: {
  apartmentId: string;
  tenantId: string;
  startDate: string; // YYYY-MM-DD recommended
}) {
  const { sheets } = getAdapters();
  const row = {
    occupancy_id: generateId("occ"),
    apartment_id: input.apartmentId,
    tenant_id: input.tenantId,
    start_date: input.startDate,
    end_date: "",
    status: "active",
    created_at: nowISO()
  };
  await sheets.appendRow("occupancies", Object.values(row));
  return row;
}

export async function endOccupancy(input: { occupancyId: string; endDate: string }) {
  const { sheets } = getAdapters();
  // We update by key (server-only)
  await sheets.updateRow("occupancies", "occupancy_id", input.occupancyId, {
    end_date: input.endDate,
    status: "ended"
  });
  return { occupancyId: input.occupancyId, endDate: input.endDate, status: "ended" };
}
