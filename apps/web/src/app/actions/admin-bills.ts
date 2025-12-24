"use server";

import { getAdapters } from "@/lib/adapters";
import { generateId } from "@/lib/utils/id";
import { nowISO } from "@/lib/utils/time";
import { notifyTenantByOccupancy } from "@/lib/notifications/notify-helpers";
import { billCreatedText } from "@/lib/notifications/templates";
import { requireAdmin } from "@/lib/auth/guards";

export async function createBill(input: {
  apartmentId: string;
  occupancyId: string;
  billPeriodStart: string;
  billPeriodEnd: string;
  expectedAmount: number;
  dueDate: string;
}) {
  await requireAdmin();

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

  await notifyTenantByOccupancy({
    occupancyId: input.occupancyId,
    subject: "New Bill/Charge Posted",
    text: billCreatedText({ amount: input.expectedAmount, dueDate: input.dueDate })
  });

  return row;
}
