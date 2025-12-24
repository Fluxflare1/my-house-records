"use server";

import { getSession } from "@/lib/auth/session";
import { getAdapters } from "@/lib/adapters";

export async function tenantUploadReceipt(input: {
  paymentId: string;
  filename: string;
  mimeType: string;
  base64: string;
}) {
  const session = await getSession();
  if (!session.user || session.user.role !== "tenant") {
    throw new Error("Unauthorized");
  }
  const tenantId = session.user.tenantId;

  const { sheets, drive } = getAdapters();
  const payments = await sheets.getAll("payments");
  const payment = payments.find((p) => String(p.payment_id) === String(input.paymentId));

  if (!payment) throw new Error("Payment not found");
  if (String(payment.tenant_id) !== String(tenantId)) {
    throw new Error("You cannot upload receipt for another tenant’s payment");
  }

  const buffer = Buffer.from(input.base64, "base64");
  const uploaded = await drive.uploadBuffer("receipts", input.filename, input.mimeType, buffer);

  await sheets.updateRow("payments", "payment_id", input.paymentId, {
    receipt_drive_file_url: uploaded.webViewLink ?? uploaded.fileId
  });

  return { ok: true, receipt: uploaded.webViewLink ?? uploaded.fileId };
}
