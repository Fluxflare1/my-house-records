import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth/guards";
import { PERMS } from "@/lib/auth/permissions";
import { bondTenantToApartment } from "@/lib/occupancy/bonding";

export async function POST(req: Request) {
  try {
    await requireAdminPermission(PERMS.MANAGE_OCCUPANCY);

    const body = await req.json();
    const tenantId = String(body?.tenantId || "").trim();
    const apartmentId = String(body?.apartmentId || "").trim();
    const startDate = String(body?.startDate || "").trim(); // YYYY-MM-DD

    if (!tenantId || !apartmentId || !startDate) {
      return NextResponse.json({ error: "Missing tenantId, apartmentId, or startDate" }, { status: 400 });
    }

    const r = await bondTenantToApartment({ tenantId, apartmentId, startDate });
    return NextResponse.json({ ok: true, occupancyId: r.occupancyId }, { status: 200 });
  } catch (e: any) {
    const msg = e?.message || "Bonding failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}



