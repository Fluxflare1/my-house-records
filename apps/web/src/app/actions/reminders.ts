"use server";

import { requireAdminPermission } from "@/lib/auth/guards";
import { PERMS } from "@/lib/auth/permissions";
import { getAdapters } from "@/lib/adapters";
import { getNotificationPorts } from "@/lib/notifications/dispatcher";
import { notifyAdmin } from "@/lib/notifications/admin-notify";

type Row = Record<string, any>;
function s(v: any) { return String(v ?? ""); }
function n(v: any) { const x = Number(v ?? 0); return Number.isFinite(x) ? x : 0; }

type Debtor = {
  tenantId: string;
  tenantName: string;
  phone: string;
  email: string;
  apartmentId: string;
  apartmentLabel: string;
  rentBalance: number;
  billBalance: number;
  totalBalance: number;
};

function isTrue(v?: string) {
  return String(v || "").toLowerCase() === "true";
}

export async function generateDebtorsReport(params?: {
  notifyTenants?: boolean;
  notifyAdmin?: boolean;
  limit?: number;
}) {
  await requireAdminPermission(PERMS.MANAGE_REMINDERS);

  const notifyTenants = !!params?.notifyTenants;
  const notifyAdminFlag = !!params?.notifyAdmin;
  const limit = params?.limit ?? 50;

  const { sheets } = getAdapters();
  const { whatsapp, email } = getNotificationPorts();

  const [occupancies, rents, bills, allocations, tenants, apartments] = await Promise.all([
    sheets.getAll("occupancies"),
    sheets.getAll("rents"),
    sheets.getAll("bills"),
    sheets.getAll("allocations"),
    sheets.getAll("tenants"),
    sheets.getAll("apartments")
  ]);

  const tenantMap = new Map<string, Row>();
  for (const t of tenants as Row[]) tenantMap.set(s(t.tenant_id), t);

  const aptMap = new Map<string, Row>();
  for (const a of apartments as Row[]) aptMap.set(s(a.apartment_id), a);

  const rentApplied = new Map<string, number>();
  const billApplied = new Map<string, number>();
  for (const a of allocations as Row[]) {
    const amt = n(a.amount_applied);
    const rid = s(a.rent_id || "");
    const bid = s(a.bill_id || "");
    if (rid) rentApplied.set(rid, (rentApplied.get(rid) ?? 0) + amt);
    if (bid) billApplied.set(bid, (billApplied.get(bid) ?? 0) + amt);
  }

  const activeOcc = (occupancies as Row[]).filter(
    (o) => s(o.status).toLowerCase() === "active" && !s(o.end_date).trim()
  );

  const occToTenant = new Map<string, string>();
  const occToApt = new Map<string, string>();
  for (const o of activeOcc) {
    occToTenant.set(s(o.occupancy_id), s(o.tenant_id));
    occToApt.set(s(o.occupancy_id), s(o.apartment_id));
  }

  const key = (tenantId: string, aptId: string) => `${tenantId}::${aptId}`;
  const agg = new Map<string, { tenantId: string; aptId: string; rent: number; bill: number }>();

  for (const r of rents as Row[]) {
    const occId = s(r.occupancy_id);
    if (!occToTenant.has(occId)) continue;
    const tenantId = occToTenant.get(occId)!;
    const aptId = occToApt.get(occId)!;

    const expected = n(r.expected_amount);
    const applied = rentApplied.get(s(r.rent_id)) ?? 0;
    const bal = expected - applied;
    if (bal <= 0.000001) continue;

    const k = key(tenantId, aptId);
    const cur = agg.get(k) ?? { tenantId, aptId, rent: 0, bill: 0 };
    cur.rent += bal;
    agg.set(k, cur);
  }

  for (const b of bills as Row[]) {
    const occId = s(b.occupancy_id);
    if (!occToTenant.has(occId)) continue;
    const tenantId = occToTenant.get(occId)!;
    const aptId = occToApt.get(occId)!;

    const expected = n(b.expected_amount);
    const applied = billApplied.get(s(b.bill_id)) ?? 0;
    const bal = expected - applied;
    if (bal <= 0.000001) continue;

    const k = key(tenantId, aptId);
    const cur = agg.get(k) ?? { tenantId, aptId, rent: 0, bill: 0 };
    cur.bill += bal;
    agg.set(k, cur);
  }

  const debtors: Debtor[] = Array.from(agg.values())
    .map((x) => {
      const t = tenantMap.get(x.tenantId) ?? {};
      const a = aptMap.get(x.aptId) ?? {};
      const tenantName = s(t.full_name || x.tenantId);
      const phone = s(t.phone || "").trim();
      const emailAddr = s(t.email || "").trim();
      const apartmentLabel = s(a.unit_label || x.aptId);

      const rentBalance = Math.max(0, x.rent);
      const billBalance = Math.max(0, x.bill);
      const totalBalance = rentBalance + billBalance;

      return {
        tenantId: x.tenantId,
        tenantName,
        phone,
        email: emailAddr,
        apartmentId: x.aptId,
        apartmentLabel,
        rentBalance,
        billBalance,
        totalBalance
      };
    })
    .filter((d) => d.totalBalance > 0.000001)
    .sort((a, b) => b.totalBalance - a.totalBalance)
    .slice(0, limit);

  const summaryText = (() => {
    if (debtors.length === 0) return "No current debtors found (active occupancies).";
    const top = debtors.slice(0, 10);
    const lines = top.map(
      (d, i) =>
        `${i + 1}. ${d.tenantName} (Apt ${d.apartmentLabel}) — Rent ₦${d.rentBalance}, Bills ₦${d.billBalance}, Total ₦${d.totalBalance}`
    );
    return `Debtors (${debtors.length}):\n` + lines.join("\n");
  })();

  if (notifyTenants) {
    for (const d of debtors) {
      const msg =
        `Payment Reminder: You have outstanding balance for Apt ${d.apartmentLabel}. ` +
        `Rent ₦${d.rentBalance}, Bills ₦${d.billBalance}. Total ₦${d.totalBalance}. ` +
        `Please make payment and upload receipt.`;

      try {
        if (isTrue(process.env.NOTIFY_WHATSAPP) && d.phone) {
          await whatsapp.sendWhatsApp({ toE164: d.phone, text: msg });
        }
        if (isTrue(process.env.NOTIFY_EMAIL) && d.email) {
          await email.sendEmail({ toEmail: d.email, subject: "Payment Reminder", text: msg });
        }
      } catch {}
    }
  }

  if (notifyAdminFlag) {
    try {
      await notifyAdmin({ subject: "Debtors Report", text: summaryText });
    } catch {}
  }

  return { count: debtors.length, debtors, summaryText };
}
