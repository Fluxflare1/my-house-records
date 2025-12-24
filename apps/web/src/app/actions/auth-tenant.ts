"use server";

import { getAdapters } from "@/lib/adapters";
import { getSession } from "@/lib/auth/session";

export async function tenantLogin(input: { tenantId: string; phone: string }) {
  const { sheets } = getAdapters();

  const tenants = await sheets.getAll("tenants");
  const tenant = tenants.find(
    (t) =>
      String(t.tenant_id) === String(input.tenantId) &&
      String(t.phone || "").trim() === String(input.phone).trim()
  );

  if (!tenant) {
    throw new Error("Invalid tenant credentials");
  }

  const session = await getSession();
  session.user = {
    role: "tenant",
    tenantId: String(input.tenantId)
  };
  await session.save();

  return { ok: true };
}
