import { NextResponse } from "next/server";
import { createApplicant } from "@/lib/applicants/applicants-repo";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const firstName = String(body?.firstName || "");
    const middleName = String(body?.middleName || "");
    const lastName = String(body?.lastName || "");
    const phone = String(body?.phone || "");
    const email = String(body?.email || "");
    const password = String(body?.password || "");

    if (!firstName || !lastName || !phone || !email || !password) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    await createApplicant({ firstName, middleName, lastName, phone, email, password });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    const msg = e?.message || "Request failed.";
    if (msg === "EMAIL_ALREADY_EXISTS") {
      return NextResponse.json({ error: "Email already exists. Please login instead." }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
