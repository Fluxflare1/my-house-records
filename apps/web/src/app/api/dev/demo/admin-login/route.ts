import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

type AdminSession = {
  email?: string;
  fullName?: string;
  role?: string;
  permissions?: string[];
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

  const demoEmail = process.env.DEMO_ADMIN_EMAIL || "admin@demo.local";
  const demoPass = process.env.DEMO_ADMIN_PASSWORD || "Admin12345!";

  if (email !== demoEmail || password !== demoPass) {
    return NextResponse.json({ error: "Invalid demo credentials" }, { status: 401 });
  }

  const cookieName = process.env.ADMIN_SESSION_COOKIE || "admin_session";
  const sessionPassword = process.env.SESSION_PASSWORD;

  if (!sessionPassword || sessionPassword.length < 32) {
    return NextResponse.json({ error: "SESSION_PASSWORD must be 32+ chars" }, { status: 500 });
  }

  const session = await getIronSession<AdminSession>(cookies(), {
    cookieName,
    password: sessionPassword,
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/"
    }
  });

  // Give super-admin permissions for testing
  session.email = demoEmail;
  session.fullName = "Demo Super Admin";
  session.role = "super_admin";
  session.permissions = ["*"];

  await session.save();

  return NextResponse.json({ ok: true }, { status: 200 });
}
