"use server";

import { getAdapters } from "@/lib/adapters";
import { generateId } from "@/lib/utils/id";
import { nowISO } from "@/lib/utils/time";
import { requireAdmin } from "@/lib/auth/guards";

export async function allocatePayment(input: {
  paymentId: string;
  amountApplied: number;
  rentId?: string;
  billId?: string;
}) {
  await requireAdmin();

  if (!input.rentId && !input.billId) {
    throw new Error("Allocation must target either rentId or billId");
  }

  const { sheets } = getAdapters();
  const row = {
    allocation_id: generateId("alloc"),
    payment_id: input.paymentId,
    rent_id: input.rentId ?? "",
    bill_id: input.billId ?? "",
    amount_applied: input.amountApplied,
    created_at: nowISO()
  };

  await sheets.appendRow("allocations", Object.values(row));
  return row;
}
