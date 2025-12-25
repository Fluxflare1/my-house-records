import "server-only";

import { cookies } from "next/headers";
import { getIronSession, type IronSessionOptions } from "iron-session";

export type TenantSession = {
  tenantId?: string;
  occupancyId?: string;
  email?: string;
  name?: string;
  role?: "tenant";
};

const sessionOptions: IronSessionOptions = {
  cookieName: process.env.TENANT_SESSION_COOKIE || "tenant_session",
  password: process.env.SESSION_PASSWORD || "CHANGE_ME_IN_ENV_CHANGE_ME_IN_ENV_CHANGE_ME_32",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  }
};

export async function getSession() {
  return getIronSession<TenantSession>(cookies(), sessionOptions);
}

// Optional helpers (safe to have)
export async function destroySession() {
  const s = await getSession();
  s.destroy();
}
