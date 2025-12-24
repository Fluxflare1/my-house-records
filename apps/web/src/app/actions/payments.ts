"use server";

import { getAdapters } from "@/lib/adapters";
import { generateId } from "@/lib/utils/id";
import { nowISO } from "@/lib/utils/time";

/**
 * Record payment (verification remains manual).
 * If a receipt file is provided, upload it to Drive (receipts folder) server-side.
 */
export async function recordPayment(input: {
  apartmentId: string;
  tenantId?: string;
  paymentDate: string; // YYYY-MM-DD or ISO
  amount: number;
  posReference?: string;
}) {
  const { sheets } = getAdapters();
  const row = {
    payment_id: generateId("pay"),
    apartment_id: input.apartmentId,
    tenant_id: input.tenantId ?? "",
    payment_date: input.paymentDate,
    amount: input.amount,
    receipt_drive_file_url: "",
    verification_status: "pending",
    pos_reference: input.posReference ?? "",
    created_at: nowISO()
  };
  await sheets.appendRow("payments", Object.values(row));
  return row;
}

/**
 * Upload receipt and attach it to an existing payment.
 * This keeps payment record stable and allows late uploads.
 */
export async function uploadPaymentReceipt(input: {
  paymentId: string;
  filename: string;
  mimeType: string;
  base64: string; // UI will send base64 later (server action)
}) {
  const { sheets, drive } = getAdapters();
  const buffer = Buffer.from(input.base64, "base64");
  const uploaded = await drive.uploadBuffer("receipts", input.filename, input.mimeType, buffer);

  await sheets.updateRow("payments", "payment_id", input.paymentId, {
    receipt_drive_file_url: uploaded.webViewLink ?? uploaded.fileId
  });

  return { paymentId: input.paymentId, receipt: uploaded.webViewLink ?? uploaded.fileId };
}

/**
 * Admin verification.
 */
export async function setPaymentVerification(input: {
  paymentId: string;
  status: "verified" | "rejected";
}) {
  const { sheets } = getAdapters();
  await sheets.updateRow("payments", "payment_id", input.paymentId, {
    verification_status: input.status
  });
  return input;
}
