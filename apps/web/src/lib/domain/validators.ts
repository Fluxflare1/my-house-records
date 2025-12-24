import { Occupancy } from "../types/occupancy";

export function ensureNoOverlap(
  existing: Occupancy[],
  apartmentId: string,
  startDate: string
) {
  const start = new Date(startDate);

  const overlap = existing.find(o =>
    o.apartment_id === apartmentId &&
    o.status === "active" &&
    (!o.end_date || new Date(o.end_date) >= start)
  );

  if (overlap) {
    throw new Error("Apartment already has an active occupancy");
  }
}

export function ensureAllocationTarget(allocation: {
  rent_id?: string;
  bill_id?: string;
}) {
  if (!allocation.rent_id && !allocation.bill_id) {
    throw new Error("Allocation must target rent or bill");
  }
}
