import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth/guards";
import { PERMS } from "@/lib/auth/permissions";
import { ensureSheetAndHeaders } from "@/lib/google/schema-ensure";

const APPLICANTS_HEADERS = [
  "applicant_id",
  "first_name",
  "middle_name",
  "last_name",
  "phone",
  "email",
  "password_hash",
  "status",
  "kyc_status",
  "preferred_apartment_type",
  "preferred_area",
  "submitted_at",
  "created_at",
  "updated_at",
  "tenant_id" // ✅ important for promotion trace
];

export async function POST() {
  try {
    await requireAdminPermission(PERMS.MANAGE_SETUP);

    const results = [];

    results.push(
      await ensureSheetAndHeaders({
        logicalSheet: "applicants",
        requiredHeaders: APPLICANTS_HEADERS
      })
    );

    // Optional: create empty "applications" tab if you mapped it
    results.push(
      await ensureSheetAndHeaders({
        logicalSheet: "applications",
        requiredHeaders: [
          "application_id",
          "applicant_id",
          "notes",
          "created_at",
          "updated_at"
        ]
      })
    );

    return NextResponse.json({ ok: true, results }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Ensure schema failed" }, { status: 500 });
  }
}
