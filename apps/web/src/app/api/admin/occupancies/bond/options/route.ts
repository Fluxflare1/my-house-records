apps/web/src/app/api/admin/occupancies/bond/options/route.ts
import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth/guards";
import { PERMS } from "@/lib/auth/permissions";
import { listApartmentsForBonding, listTenantsForBonding } from "@/lib/occupancy/bonding";

export async function GET() {
  try {
    await requireAdminPermission(PERMS.MANAGE_OCCUPANCY);

    const [tenants, apartments] = await Promise.all([
      listTenantsForBonding(),
      listApartmentsForBonding()
    ]);

    return NextResponse.json({ tenants, apartments }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
