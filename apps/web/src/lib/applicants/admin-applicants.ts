import "server-only";

import { getAllRows, nowIso, updateRowById } from "@/lib/google/sheets";
import { createTenantFromApplicant } from "@/lib/tenants/tenants-repo";

export type ApplicantListItem = {
  applicant_id: string;
  full_name: string;
  phone: string;
  email: string;
  status: string;
  kyc_status: string;
  preferred_apartment_type: string;
  preferred_area: string;
  submitted_at: string;
};

function norm(v: string) {
  return (v || "").trim();
}

export async function listApplicants() {
  const { rows } = await getAllRows("applicants");
  const items: ApplicantListItem[] = rows.map((r) => {
    const first = norm(r["first_name"]);
    const middle = norm(r["middle_name"]);
    const last = norm(r["last_name"]);
    const full = [first, middle, last].filter(Boolean).join(" ");

    return {
      applicant_id: norm(r["applicant_id"]),
      full_name: full || "(No name)",
      phone: norm(r["phone"]),
      email: norm(r["email"]),
      status: norm(r["status"]) || "DRAFT",
      kyc_status: norm(r["kyc_status"]) || "INCOMPLETE",
      preferred_apartment_type: norm(r["preferred_apartment_type"]),
      preferred_area: norm(r["preferred_area"]),
      submitted_at: norm(r["submitted_at"])
    };
  });

  // newest first (submitted_at), then created order
  items.sort((a, b) => (b.submitted_at || "").localeCompare(a.submitted_at || ""));
  return items;
}

export async function setApplicantStatus(applicantId: string, status: "APPROVED" | "REJECTED") {
  const now = nowIso();
  await updateRowById("applicants", "applicant_id", applicantId, {
    status,
    updated_at: now
  });
}

export async function promoteApplicantToTenant(applicantId: string) {
  const { rows } = await getAllRows("applicants");
  const row = rows.find((r) => norm(r["applicant_id"]) === applicantId);
  if (!row) throw new Error("APPLICANT_NOT_FOUND");

  const status = (row["status"] || "").toUpperCase().trim();
  const kyc = (row["kyc_status"] || "").toUpperCase().trim();

  if (kyc !== "SUBMITTED") throw new Error("KYC_NOT_SUBMITTED");
  if (status !== "APPROVED" && status !== "PROMOTED") {
    throw new Error("NOT_APPROVED");
  }

  // If already promoted, we do nothing but still succeed
  if (status === "PROMOTED") {
    return { ok: true, tenantId: row["tenant_id"] || "" };
  }

  const firstName = norm(row["first_name"]);
  const middleName = norm(row["middle_name"]);
  const lastName = norm(row["last_name"]);
  const phone = norm(row["phone"]);
  const email = norm(row["email"]);

  const { tenantId } = await createTenantFromApplicant({
    firstName,
    middleName,
    lastName,
    phone,
    email,
    sourceApplicantId: applicantId
  });

  const now = nowIso();
  await updateRowById("applicants", "applicant_id", applicantId, {
    status: "PROMOTED",
    updated_at: now,
    tenant_id: tenantId // if this column exists, it’ll be saved; otherwise ignored by update helper
  });

  return { ok: true, tenantId };
}
