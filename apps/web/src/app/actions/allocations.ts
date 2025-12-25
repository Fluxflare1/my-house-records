"use server";

import { getAdapters } from "@/lib/adapters";
import { generateId } from "@/lib/utils/id";
import { nowISO } from "@/lib/utils/time";
import { requireAdmin } from "@/lib/auth/guards";

function n(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

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
  if (input.rentId && input.billId) {
    throw new Error("Allocation must target only one: rentId OR billId");
  }

  const amt = n(input.amountApplied);
  if (amt <= 0) throw new Error("Allocation amount must be greater than 0");

  const { sheets } = getAdapters();

  const [payments, allocations] = await Promise.all([
    sheets.getAll("payments"),
    sheets.getAll("allocations")
  ]);

  const payment = payments.find((p) => String(p.payment_id) === String(input.paymentId));
  if (!payment) throw new Error("Payment not found");

  const status = String(payment.verification_status || "").toLowerCase();
  if (status !== "verified") {
    throw new Error("Only VERIFIED payments can be allocated");
  }

  const paymentAmount = n(payment.amount);

  const alreadyAllocated = (allocations as any[])
    .filter((a) => String(a.payment_id) === String(input.paymentId))
    .reduce((sum, a) => sum + n(a.amount_applied), 0);

  if (alreadyAllocated + amt > paymentAmount + 0.000001) {
    throw new Error(
      `Allocation exceeds payment amount. Payment ₦${paymentAmount}, already allocated ₦${alreadyAllocated}, attempted ₦${amt}.`
    );
  }

  const row = {
    allocation_id: generateId("alloc"),
    payment_id: input.paymentId,
    rent_id: input.rentId ?? "",
    bill_id: input.billId ?? "",
    amount_applied: amt,
    created_at: nowISO()
  };

  await sheets.appendRow("allocations", Object.values(row));
  return row;
}
