"use server";

import { requireTenant } from "@/lib/auth/guards";
import { getAdapters } from "@/lib/adapters";
import { notifyAdmin } from "@/lib/notifications/admin-notify";
import { getNotificationPorts } from "@/lib/notifications/dispatcher";
import { receiptUploadedAdminText, receiptUploadedTenantText } from "@/lib/notifications/templates";

function s(v: any) {
  return String(v ?? "");
}
function n(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

export async function tenantUploadReceipt(input: {
  paymentId: string;
  filename: string;
  mimeType: string;
  base64: string;
}) {
  const user = await requireTenant();
  const tenantId = user.tenantId;

  const { sheets, drive } = getAdapters();
  const payments = await sheets.getAll("payments");
  const payment = payments.find((p: any) => s(p.payment_id) === s(input.paymentId));

  if (!payment) throw new Error("Payment not found");
  if (s(payment.tenant_id) !== s(tenantId)) {
    throw new Error("You cannot upload receipt for another tenant’s payment");
  }

  const buffer = Buffer.from(input.base64, "base64");
  const uploaded = await drive.uploadBuffer("receipts", input.filename, input.mimeType, buffer);

  await sheets.updateRow("payments", "payment_id", input.paymentId, {
    receipt_drive_file_url: uploaded.webViewLink ?? uploaded.fileId
  });

  // Notify tenant acknowledgement (WhatsApp/Email if enabled)
  try {
    const tenants = await sheets.getAll("tenants");
    const tenant = tenants.find((t: any) => s(t.tenant_id) === s(tenantId));
    const phone = s(tenant?.phone || "").trim();
    const email = s(tenant?.email || "").trim();

    const { whatsapp, email: emailPort } = getNotificationPorts();
    const text = receiptUploadedTenantText({ paymentId: input.paymentId });

    if (phone) await whatsapp.sendWhatsApp({ toE164: phone, text });
    if (email) await emailPort.sendEmail({ toEmail: email, subject: "Receipt Received", text });
  } catch {
    // do not fail upload
  }

  // Notify admin
  try {
    const tenants = await sheets.getAll("tenants");
    const tenant = tenants.find((t: any) => s(t.tenant_id) === s(tenantId));
    const tenantLabel = s(tenant?.full_name || tenantId);

    await notifyAdmin({
      subject: "Receipt Uploaded",
      text: receiptUploadedAdminText({
        tenantLabel,
        paymentId: input.paymentId,
        amount: n(payment.amount)
      })
    });
  } catch {
    // do not fail upload
  }

  return { ok: true, receipt: uploaded.webViewLink ?? uploaded.fileId };
}
