"use server";

import { getAdapters } from "@/lib/adapters";
import { generateId } from "@/lib/utils/id";
import { nowISO } from "@/lib/utils/time";
import { notifyTenantByPayment } from "@/lib/notifications/notify-helpers";
import { paymentStatusText } from "@/lib/notifications/templates";

export async function recordPayment(input: {
  apartmentId: string;
  tenantId?: string;
  paymentDate: string;
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

export async function uploadPaymentReceipt(input: {
  paymentId: string;
  filename: string;
  mimeType: string;
  base64: string;
}) {
  const { sheets, drive } = getAdapters();
  const buffer = Buffer.from(input.base64, "base64");
  const uploaded = await drive.uploadBuffer("receipts", input.filename, input.mimeType, buffer);

  await sheets.updateRow("payments", "payment_id", input.paymentId, {
    receipt_drive_file_url: uploaded.webViewLink ?? uploaded.fileId
  });

  return { paymentId: input.paymentId, receipt: uploaded.webViewLink ?? uploaded.fileId };
}

export async function setPaymentVerification(input: {
  paymentId: string;
  status: "verified" | "rejected";
}) {
  const { sheets } = getAdapters();
  await sheets.updateRow("payments", "payment_id", input.paymentId, {
    verification_status: input.status
  });

  await notifyTenantByPayment({
    paymentId: input.paymentId,
    subject: "Payment Status Updated",
    text: paymentStatusText({ status: input.status })
  });

  return input;
}
