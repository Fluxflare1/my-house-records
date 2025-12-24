export type OccupancyRow = {
  occupancy_id: string;
  apartment_id: string;
  tenant_id: string;
  start_date: string;
  end_date?: string;
  status: string;
};

function toDateOrNull(v?: string) {
  if (!v || String(v).trim() === "") return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Rule:
 * - An apartment can have only ONE active occupancy at a time.
 * - Any existing occupancy with status=active and no end_date blocks new bond.
 * - If end_date exists, it must be < new start_date to allow new bond.
 */
export function assertNoActiveOccupancyOverlap(params: {
  apartmentId: string;
  newStartDate: string;
  existingOccupancies: OccupancyRow[];
}) {
  const start = toDateOrNull(params.newStartDate);
  if (!start) throw new Error("Invalid start_date. Use YYYY-MM-DD or ISO date.");

  const conflict = params.existingOccupancies.find((o) => {
    if (String(o.apartment_id) !== String(params.apartmentId)) return false;

    const status = String(o.status || "").toLowerCase();
    if (status !== "active") return false;

    const end = toDateOrNull(o.end_date);
    // If no end date, it's definitely active and blocks.
    if (!end) return true;

    // If end date exists but is on/after new start, overlap.
    return end.getTime() >= start.getTime();
  });

  if (conflict) {
    throw new Error(
      `Occupancy overlap: apartment already has an active occupancy (${conflict.occupancy_id}). End it before bonding a new tenant.`
    );
  }
}
