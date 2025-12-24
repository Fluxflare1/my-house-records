"use server";

import { getAdapters } from "@/lib/adapters";
import { generateId } from "@/lib/utils/id";
import { nowISO } from "@/lib/utils/time";
import { notifyTenantByOccupancy } from "@/lib/notifications/notify-helpers";
import { rentCreatedText } from "@/lib/notifications/templates";

export async function createRent(input: {
  apartmentId: string;
  occupancyId: string;
  rentPeriodStart: string;
  rentPeriodEnd: string;
  expectedAmount: number;
  dueDate: string;
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

  await notifyTenantByOccupancy({
    occupancyId: input.occupancyId,
    subject: "New Rent Posted",
    text: rentCreatedText({ amount: input.expectedAmount, dueDate: input.dueDate })
  });

  return row;
}
