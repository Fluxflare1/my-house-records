"use server";

import { cookies } from "next/headers";
import { getSession } from "@/lib/auth/session";
import { verifyAdminLogin } from "@/lib/auth/admin";

export async function adminLogin(input: { email: string; password: string }) {
  const ok = await verifyAdminLogin(input.email, input.password);
  if (!ok) throw new Error("Invalid admin credentials");

  const session = await getSession();
  session.user = { role: "admin", email: input.email };
  await session.save();

  // middleware gate cookie
  cookies().set("mhr_role", "admin", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });

  return { ok: true };
}
