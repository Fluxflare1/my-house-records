"use server";

import { getAdapters } from "@/lib/adapters";
import { generateId } from "@/lib/utils/id";
import { nowISO } from "@/lib/utils/time";
import { notifyTenantByPayment } from "@/lib/notifications/notify-helpers";
import { notifyAdmin } from "@/lib/notifications/admin-notify";
import { paymentStatusText, paymentRecordedAdminText } from "@/lib/notifications/templates";
import { requireAdmin } from "@/lib/auth/guards";

function s(v: any) {
  return String(v ?? "");
}
function n(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

export async function recordPayment(input: {
  apartmentId: string;
  tenantId?: string;
  paymentDate: string;
  amount: number;
  posReference?: string;
}) {
  await requireAdmin();

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

  // Admin notification (optional)
  try {
    const [apartments, tenants] = await Promise.all([sheets.getAll("apartments"), sheets.getAll("tenants")]);
    const apt = apartments.find((a: any) => s(a.apartment_id) === s(input.apartmentId));
    const ten = input.tenantId ? tenants.find((t: any) => s(t.tenant_id) === s(input.tenantId)) : null;

    const aptLabel = s(apt?.unit_label || input.apartmentId);
    const tenLabel = input.tenantId ? s(ten?.full_name || input.tenantId) : "—";

    await notifyAdmin({
      subject: "New Payment Recorded (Pending Verification)",
      text: paymentRecordedAdminText({
        paymentId: row.payment_id,
        apartmentLabel: aptLabel,
        tenantLabel: tenLabel,
        amount: n(row.amount),
        paymentDate: s(row.payment_date)
      })
    });
  } catch {
    // Never block recording due to notification failure
  }

  return row;
}

export async function uploadPaymentReceipt(input: {
  paymentId: string;
  filename: string;
  mimeType: string;
  base64: string;
}) {
  await requireAdmin();

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
  await requireAdmin();

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
