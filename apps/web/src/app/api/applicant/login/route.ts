import { NextResponse } from "next/server";
import { authenticateApplicant } from "@/lib/applicants/applicants-repo";
import { getApplicantSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || "");
    const password = String(body?.password || "");

    const authed = await authenticateApplicant(email, password);
    if (!authed) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const session = await getApplicantSession();
    session.applicant = {
      applicantId: authed.applicantId,
      email: authed.email,
      status: authed.status,
      kycStatus: authed.kycStatus
    };
    await session.save();

    const next = authed.kycStatus !== "SUBMITTED" ? "/applicant/kyc" : "/applicant";
    return NextResponse.json({ ok: true, next }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Login failed." }, { status: 500 });
  }
}
