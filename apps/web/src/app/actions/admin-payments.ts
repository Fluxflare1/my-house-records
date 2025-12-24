"use server";

import { AdminVerificationService } from "@/lib/services/admin-verification.service";

export async function verifyPaymentAction(
  paymentId: string,
  status: "verified" | "rejected"
) {
  const svc = new AdminVerificationService();
  await svc.verifyPayment(paymentId, status);
}
