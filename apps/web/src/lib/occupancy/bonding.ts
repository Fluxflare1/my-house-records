import "server-only";

import { appendRow, getAllRows, nowIso, updateRowById } from "@/lib/google/sheets";

function genId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function listTenantsForBonding() {
  const { rows } = await getAllRows("tenants");
  // Expect at least tenant_id, first_name/last_name, phone/email columns
  return rows
    .map((r) => ({
      tenant_id: (r["tenant_id"] || "").trim(),
      name: [r["first_name"], r["middle_name"], r["last_name"]].filter(Boolean).join(" ").trim(),
      email: (r["email"] || "").trim(),
      phone: (r["phone"] || "").trim()
    }))
    .filter((t) => t.tenant_id);
}

export async function listAvailableApartments() {
  const { rows } = await getAllRows("apartments");

  // We treat an apartment as "available" if status is AVAILABLE / VACANT / empty
  // (this keeps compatibility with your earlier sheets)
  return rows
    .map((r) => {
      const status = (r["status"] || "").trim().toUpperCase();
      const apartmentId = (r["apartment_id"] || "").trim();
      const label =
        (r["label"] || r["unit_label"] || r["unit_code"] || r["name"] || apartmentId).trim();

      return {
        apartment_id: apartmentId,
        label,
        apartment_type: (r["apartment_type"] || r["type"] || "").trim(),
        property_id: (r["property_id"] || "").trim(),
        status: status || ""
      };
    })
    .filter((a) => a.apartment_id)
    .filter((a) => !a.status || a.status === "AVAILABLE" || a.status === "VACANT");
}

export async function bondTenantToApartment(input: {
  tenantId: string;
  apartmentId: string;
  startDate: string; // ISO date string (YYYY-MM-DD)
}) {
  const now = nowIso();
  const occupancyId = genId("occ");

  // 1) create occupancy
  await appendRow("occupancies", [
    occupancyId,
    input.apartmentId,
    input.tenantId,
    input.startDate,
    "", // end_date
    "ACTIVE",
    now,
    now
  ]);

  // 2) mark apartment as occupied (best effort, only if columns exist)
  await updateRowById("apartments", "apartment_id", input.apartmentId, {
    status: "OCCUPIED",
    updated_at: now
  }).catch(() => {});

  return { occupancyId };
}



code 2
import "server-only";

import { appendRow, getAllRows, nowIso, updateRowById } from "@/lib/google/sheets";

function genId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function norm(v: any) {
  return String(v ?? "").trim();
}

export async function listTenantsForBonding() {
  const { rows } = await getAllRows("tenants");

  return rows
    .map((r) => {
      const tenantId = norm(r["tenant_id"]);
      const name = [r["first_name"], r["middle_name"], r["last_name"]].filter(Boolean).join(" ").trim();

      return {
        tenant_id: tenantId,
        name: name || tenantId,
        email: norm(r["email"]),
        phone: norm(r["phone"])
      };
    })
    .filter((t) => !!t.tenant_id);
}

export async function listApartmentsForBonding() {
  const { rows } = await getAllRows("apartments");

  // “available” logic: allow if status is empty or AVAILABLE/VACANT
  return rows
    .map((r) => {
      const apartmentId = norm(r["apartment_id"]);
      const status = norm(r["status"]).toUpperCase();
      const label =
        norm(r["label"]) ||
        norm(r["unit_label"]) ||
        norm(r["unit_code"]) ||
        norm(r["name"]) ||
        apartmentId;

      return {
        apartment_id: apartmentId,
        label,
        apartment_type: norm(r["apartment_type"]) || norm(r["type"]),
        property_id: norm(r["property_id"]),
        status
      };
    })
    .filter((a) => !!a.apartment_id)
    .filter((a) => !a.status || a.status === "AVAILABLE" || a.status === "VACANT");
}

export async function bondTenantToApartment(input: {
  tenantId: string;
  apartmentId: string;
  startDate: string; // YYYY-MM-DD
}) {
  const now = nowIso();
  const occupancyId = genId("occ");

  // Create occupancy record (history begins here)
  await appendRow("occupancies", [
    occupancyId,
    input.apartmentId,
    input.tenantId,
    input.startDate,
    "", // end_date
    "ACTIVE",
    now,
    now
  ]);

  // Best-effort: mark apartment occupied (if columns exist)
  await updateRowById("apartments", "apartment_id", input.apartmentId, {
    status: "OCCUPIED",
    updated_at: now
  }).catch(() => {});

  return { occupancyId };
}
