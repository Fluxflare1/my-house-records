"use server";

import { getAdapters } from "@/lib/adapters";
import { generateId } from "@/lib/utils/id";
import { nowISO } from "@/lib/utils/time";

/**
 * Bills/Charges only (NOT rent).
 * This writes to the "bills" table only.
 */
export async function createBill(input: {
  apartmentId: string;
  occupancyId: string;
  billPeriodStart: string; // YYYY-MM-DD or ISO
  billPeriodEnd: string;   // YYYY-MM-DD or ISO
  expectedAmount: number;
  dueDate: string;         // YYYY-MM-DD or ISO
}) {
  const { sheets } = getAdapters();
  const row = {
    bill_id: generateId("bill"),
    apartment_id: input.apartmentId,
    occupancy_id: input.occupancyId,
    bill_period_start: input.billPeriodStart,
    bill_period_end: input.billPeriodEnd,
    expected_amount: input.expectedAmount,
    due_date: input.dueDate,
    status: "unpaid",
    created_at: nowISO()
  };
  await sheets.appendRow("bills", Object.values(row));
  return row;
}
