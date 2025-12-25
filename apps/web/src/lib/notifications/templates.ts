export function rentCreatedText(params: { amount: number; dueDate: string }) {
  return `New Rent Posted: Amount ${params.amount}. Due date: ${params.dueDate}.`;
}

export function billCreatedText(params: { amount: number; dueDate: string }) {
  return `New Bill/Charge Posted: Amount ${params.amount}. Due date: ${params.dueDate}.`;
}

export function paymentStatusText(params: { status: "verified" | "rejected" }) {
  return `Your payment has been ${params.status.toUpperCase()}.`;
}


export function receiptUploadedTenantText(params: { paymentId: string }) {
  return `Receipt received for Payment ${params.paymentId}. Admin will verify it against POS shortly.`;
}

export function receiptUploadedAdminText(params: {
  tenantLabel: string;
  paymentId: string;
  amount?: number;
}) {
  const amt = params.amount != null ? ` ₦${params.amount}` : "";
  return `Receipt uploaded: Tenant ${params.tenantLabel}, Payment ${params.paymentId}${amt}. Please verify on POS and mark VERIFIED/REJECTED.`;
}

export function paymentRecordedAdminText(params: {
  paymentId: string;
  apartmentLabel: string;
  tenantLabel: string;
  amount: number;
  paymentDate: string;
}) {
  return `New payment recorded (PENDING): ${params.paymentId} | ₦${params.amount} | Apt ${params.apartmentLabel} | Tenant ${params.tenantLabel} | ${params.paymentDate}. Verify on POS.`;
}
