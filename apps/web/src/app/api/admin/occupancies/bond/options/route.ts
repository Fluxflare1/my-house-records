import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth/guards";
import { PERMS } from "@/lib/auth/permissions";
import { listAvailableApartments, listTenantsForBonding } from "@/lib/occupancy/bonding";

export async function GET() {
  try {
    await requireAdminPermission(PERMS.MANAGE_OCCUPANCY);

    const [tenants, apartments] = await Promise.all([
      listTenantsForBonding(),
      listAvailableApartments()
    ]);

    return NextResponse.json({ tenants, apartments }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
