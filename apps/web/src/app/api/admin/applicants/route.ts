import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth/guards";
import { PERMS } from "@/lib/auth/permissions";
import { listApplicants, promoteApplicantToTenant, setApplicantStatus } from "@/lib/applicants/admin-applicants";

export async function GET() {
  try {
    await requireAdminPermission(PERMS.MANAGE_OCCUPANCY);
    const items = await listApplicants();
    return NextResponse.json({ items }, { status: 200 });
  } catch (e: any) {
    const msg = e?.message || "Failed";
    const code = msg.includes("ADMIN_") ? 401 : 500;
    return NextResponse.json({ error: msg }, { status: code });
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdminPermission(PERMS.MANAGE_OCCUPANCY);

    const body = await req.json();
    const applicantId = String(body?.applicantId || "").trim();
    const action = String(body?.action || "").trim();

    if (!applicantId) return NextResponse.json({ error: "Missing applicantId" }, { status: 400 });

    if (action === "approve") {
      await setApplicantStatus(applicantId, "APPROVED");
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    if (action === "reject") {
      await setApplicantStatus(applicantId, "REJECTED");
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    if (action === "promote") {
      const r = await promoteApplicantToTenant(applicantId);
      return NextResponse.json({ ok: true, tenantId: r.tenantId }, { status: 200 });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    const msg = e?.message || "Failed";
    // business errors
    if (msg === "KYC_NOT_SUBMITTED" || msg === "NOT_APPROVED") {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    if (msg.includes("ADMIN_")) return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
