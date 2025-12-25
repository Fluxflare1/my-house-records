import { NextResponse } from "next/server";
import { getApplicantSession } from "@/lib/auth/session";
import { submitKyc } from "@/lib/applicants/applicants-repo";

export async function POST(req: Request) {
  try {
    const session = await getApplicantSession();
    const applicant = session.applicant;
    if (!applicant) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

    const body = await req.json();
    const preferredApartmentType = String(body?.preferredApartmentType || "");
    const preferredArea = String(body?.preferredArea || "");

    if (!preferredApartmentType || !preferredArea) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    await submitKyc(applicant.applicantId, { preferredApartmentType, preferredArea });

    // refresh session info
    applicant.status = "PENDING_APPROVAL";
    applicant.kycStatus = "SUBMITTED";
    session.applicant = applicant;
    await session.save();

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Submission failed." }, { status: 500 });
  }
}
