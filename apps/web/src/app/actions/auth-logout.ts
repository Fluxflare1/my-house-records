"use server";

import { cookies } from "next/headers";
import { getSession } from "@/lib/auth/session";

export async function logout() {
  const session = await getSession();
  session.destroy();

  // Clear middleware gate cookies
  cookies().set("mhr_role", "", { path: "/", maxAge: 0 });
  cookies().set("mhr_tenant_id", "", { path: "/", maxAge: 0 });

  return { ok: true };
}
