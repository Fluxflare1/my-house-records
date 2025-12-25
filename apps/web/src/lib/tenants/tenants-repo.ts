import "server-only";

import { getAllRows, nowIso } from "@/lib/google/sheets";
import { appendRow } from "@/lib/google/sheets";

function genId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Creates a tenant row while respecting whatever headers exist in your "tenants" sheet.
 * We fill known fields if present; unknown fields remain blank.
 */
export async function createTenantFromApplicant(input: {
  firstName: string;
  middleName?: string;
  lastName: string;
  phone: string;
  email: string;
  sourceApplicantId: string;
}) {
  const now = nowIso();
  const tenantId = genId("tenant");

  // Read headers from tenants sheet
  const { headers } = await getAllRows("tenants").catch(() => ({ headers: [] as string[] }));

  // If tenants sheet is not ready, fail explicitly (better than corrupt data)
  if (!headers.length) {
    throw new Error(
      'TENANTS_SHEET_MISSING_HEADERS: Ensure "tenants" tab exists and has headers.'
    );
  }

  // Build row aligned to headers
  const row = headers.map((h) => {
    const key = h.trim().toLowerCase();

    if (key === "tenant_id") return tenantId;
    if (key === "first_name") return input.firstName.trim();
    if (key === "middle_name") return (input.middleName || "").trim();
    if (key === "last_name" || key === "surname") return input.lastName.trim();
    if (key === "phone") return input.phone.trim();
    if (key === "email") return input.email.trim().toLowerCase();
    if (key === "source_applicant_id") return input.sourceApplicantId;
    if (key === "created_at") return now;
    if (key === "updated_at") return now;

    // common optional fields
    if (key === "status") return "ACTIVE";
    if (key === "is_active") return "TRUE";

    return "";
  });

  await appendRow("tenants", row);

  return { tenantId };
}
