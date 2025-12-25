"use server";

import { getAdapters } from "@/lib/adapters";
import { requireAdminPermission } from "@/lib/auth/guards";
import { PERMS } from "@/lib/auth/permissions";
import { generateId } from "@/lib/utils/id";
import { nowISO } from "@/lib/utils/time";

type Row = Record<string, any>;
function s(v: any) { return String(v ?? "").trim(); }

function isActiveOcc(o: Row) {
  return s(o.status).toLowerCase() === "active" && !s(o.end_date);
}

export async function listOccupancies() {
  await requireAdminPermission(PERMS.MANAGE_OCCUPANCY);

  const { sheets } = getAdapters();
  const [occupancies, apartments, tenants] = await Promise.all([
    sheets.getAll("occupancies"),
    sheets.getAll("apartments"),
    sheets.getAll("tenants")
  ]);

  const aptLabel = new Map<string, string>();
  for (const a of apartments as Row[]) {
    aptLabel.set(s(a.apartment_id), s(a.unit_label || a.apartment_id));
  }

  const tenantName = new Map<string, string>();
  for (const t of tenants as Row[]) {
    tenantName.set(s(t.tenant_id), s(t.full_name || t.tenant_id));
  }

  return (occupancies as Row[])
    .slice()
    .sort((a, b) => s(b.created_at).localeCompare(s(a.created_at)))
    .map((o) => ({
      occupancyId: s(o.occupancy_id),
      apartmentId: s(o.apartment_id),
      apartmentLabel: aptLabel.get(s(o.apartment_id)) ?? s(o.apartment_id),
      tenantId: s(o.tenant_id),
      tenantName: tenantName.get(s(o.tenant_id)) ?? s(o.tenant_id),
      startDate: s(o.start_date),
      endDate: s(o.end_date),
      status: s(o.status) || "active",
      createdAt: s(o.created_at)
    }));
}

/**
 * Bond tenant to apartment by creating a NEW active occupancy.
 * Rules enforced:
 * - Apartment cannot have another active occupancy.
 * - Tenant cannot have another active occupancy (strict mode).
 */
export async function createOccupancy(input: {
  apartmentId: string;
  tenantId: string;
  startDate: string; // YYYY-MM-DD
}) {
  await requireAdminPermission(PERMS.MANAGE_OCCUPANCY);

  const apartmentId = s(input.apartmentId);
  const tenantId = s(input.tenantId);
  const startDate = s(input.startDate);

  if (!apartmentId) throw new Error("Apartment is required");
  if (!tenantId) throw new Error("Tenant is required");
  if (!startDate) throw new Error("Start date is required");

  const { sheets } = getAdapters();
  const [occupancies, apartments, tenants] = await Promise.all([
    sheets.getAll("occupancies"),
    sheets.getAll("apartments"),
    sheets.getAll("tenants")
  ]);

  // Validate apartment exists
  const apt = (apartments as Row[]).find((a) => s(a.apartment_id) === apartmentId);
  if (!apt) throw new Error("Apartment not found");

  // Validate tenant exists
  const ten = (tenants as Row[]).find((t) => s(t.tenant_id) === tenantId);
  if (!ten) throw new Error("Tenant not found");

  // Rule 1: apartment must not already be occupied
  const aptAlreadyActive = (occupancies as Row[]).some(
    (o) => s(o.apartment_id) === apartmentId && isActiveOcc(o)
  );
  if (aptAlreadyActive) {
    throw new Error("This apartment already has an active occupancy. Vacate first.");
  }

  // Rule 2: tenant must not already be active elsewhere (strict)
  const tenantAlreadyActive = (occupancies as Row[]).some(
    (o) => s(o.tenant_id) === tenantId && isActiveOcc(o)
  );
  if (tenantAlreadyActive) {
    throw new Error("This tenant already has an active occupancy. Vacate the tenant first.");
  }

  const row = {
    occupancy_id: generateId("occ"),
    apartment_id: apartmentId,
    tenant_id: tenantId,
    start_date: startDate,
    end_date: "",
    status: "active",
    created_at: nowISO()
  };

  await sheets.appendRow("occupancies", Object.values(row));

  return { ok: true, occupancyId: row.occupancy_id };
}

/**
 * Vacate occupancy.
 * Rules enforced:
 * - Must exist
 * - Must be active
 * - Sets end_date and status=ended
 */
export async function vacateOccupancy(input: {
  occupancyId: string;
  endDate: string; // YYYY-MM-DD
}) {
  await requireAdminPermission(PERMS.MANAGE_OCCUPANCY);

  const occupancyId = s(input.occupancyId);
  const endDate = s(input.endDate);
  if (!occupancyId) throw new Error("Occupancy ID is required");
  if (!endDate) throw new Error("End date is required");

  const { sheets } = getAdapters();
  const occupancies = (await sheets.getAll("occupancies")) as Row[];

  const occ = occupancies.find((o) => s(o.occupancy_id) === occupancyId);
  if (!occ) throw new Error("Occupancy not found");

  if (!isActiveOcc(occ)) {
    throw new Error("This occupancy is not active (already ended).");
  }

  await sheets.updateRow("occupancies", "occupancy_id", occupancyId, {
    end_date: endDate,
    status: "ended"
  });

  return { ok: true };
}
