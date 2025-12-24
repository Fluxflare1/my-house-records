import "server-only";
import { getAdapters } from "@/lib/adapters";
import { getNotificationPorts } from "./dispatcher";

type Tenant = { tenant_id: string; phone?: string; email?: string; full_name?: string };

export async function notifyTenantByOccupancy(params: {
  occupancyId: string;
  subject: string;
  text: string;
}) {
  const { sheets } = getAdapters();
  const { whatsapp, email } = getNotificationPorts();

  const occupancies = await sheets.getAll("occupancies");
  const occ = occupancies.find((o) => String(o.occupancy_id) === String(params.occupancyId));
  if (!occ) return;

  const tenants = await sheets.getAll("tenants");
  const tenant = tenants.find((t) => String(t.tenant_id) === String(occ.tenant_id)) as Tenant | undefined;
  if (!tenant) return;

  if (tenant.phone && String(tenant.phone).trim()) {
    await whatsapp.sendWhatsApp({ toE164: String(tenant.phone).trim(), text: params.text });
  }
  if (tenant.email && String(tenant.email).trim()) {
    await email.sendEmail({ toEmail: String(tenant.email).trim(), subject: params.subject, text: params.text });
  }
}

export async function notifyTenantByPayment(params: {
  paymentId: string;
  subject: string;
  text: string;
}) {
  const { sheets } = getAdapters();
  const { whatsapp, email } = getNotificationPorts();

  const payments = await sheets.getAll("payments");
  const pay = payments.find((p) => String(p.payment_id) === String(params.paymentId));
  if (!pay) return;

  const tenantId = String(pay.tenant_id || "").trim();
  if (!tenantId) return; // if admin recorded payment without tenant_id, cannot notify tenant

  const tenants = await sheets.getAll("tenants");
  const tenant = tenants.find((t) => String(t.tenant_id) === tenantId) as Tenant | undefined;
  if (!tenant) return;

  if (tenant.phone && String(tenant.phone).trim()) {
    await whatsapp.sendWhatsApp({ toE164: String(tenant.phone).trim(), text: params.text });
  }
  if (tenant.email && String(tenant.email).trim()) {
    await email.sendEmail({ toEmail: String(tenant.email).trim(), subject: params.subject, text: params.text });
  }
}
