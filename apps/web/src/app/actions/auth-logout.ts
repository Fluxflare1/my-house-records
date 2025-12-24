"use server";

import { getSession } from "@/lib/auth/session";

export async function logout() {
  const session = await getSession();
  session.destroy();
  return { ok: true };
}
