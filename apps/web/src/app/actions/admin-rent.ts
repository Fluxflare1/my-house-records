"use server";

import { getAdapters } from "@/lib/adapters";
import { generateId } from "@/lib/utils/id";
import { nowISO } from "@/lib/utils/time";

/**
 * Rent is NOT a bill.
 * This writes to the "rents" table only.
 */
export async function createRent(input: {
  apartmentId: string;
  occupancyId: string;
  rentPeriodStart: string; // YYYY-MM-DD or ISO
  rentPeriodEnd: string;   // YYYY-MM-DD or ISO
  expectedAmount: number;
  dueDate: string;         // YYYY-MM-DD or ISO
}) {
  const { sheets } = getAdapters();
  const row = {
    rent_id: generateId("rent"),
    apartment_id: input.apartmentId,
    occupancy_id: input.occupancyId,
    rent_period_start: input.rentPeriodStart,
    rent_period_end: input.rentPeriodEnd,
    expected_amount: input.expectedAmount,
    due_date: input.dueDate,
    status: "unpaid",
    created_at: nowISO()
  };
  await sheets.appendRow("rents", Object.values(row));
  return row;
}
