import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

type TenantSession = {
  tenantId?: string;
  occupancyId?: string;
  email?: string;
  name?: string;
  role?: "tenant";
};

function isDev() {
  return process.env.NODE_ENV !== "production";
}

export async function POST(req: Request) {
  if (!isDev()) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const email = String(body?.email || "").trim();
  const password = String(body?.password || "").trim();

  const demoEmail = process.env.DEMO_TENANT_EMAIL || "tenant@demo.local";
  const demoPass = process.env.DEMO_TENANT_PASSWORD || "Tenant12345!";

  if (email !== demoEmail || password !== demoPass) {
    return NextResponse.json({ error: "Invalid demo credentials" }, { status: 401 });
  }

  const cookieName = process.env.TENANT_SESSION_COOKIE || "tenant_session";
  const sessionPassword = process.env.SESSION_PASSWORD;

  if (!sessionPassword || sessionPassword.length < 32) {
    return NextResponse.json({ error: "SESSION_PASSWORD must be 32+ chars" }, { status: 500 });
  }

  const session = await getIronSession<TenantSession>(cookies(), {
    cookieName,
    password: sessionPassword,
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/"
    }
  });

  // Fake identity for testing UI
  session.role = "tenant";
  session.email = demoEmail;
  session.name = "Demo Tenant";
  session.tenantId = "tenant_demo";
  session.occupancyId = "occ_demo";

  await session.save();

  return NextResponse.json({ ok: true }, { status: 200 });
}
