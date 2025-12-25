"use server";

import { requireTenant } from "@/lib/auth/guards";
import { getAdapters } from "@/lib/adapters";

type Row = Record<string, any>;

function s(v: any) {
  return String(v ?? "").trim();
}
function n(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

function firstName(fullName: string) {
  const parts = fullName.split(/\s+/).filter(Boolean);
  return parts[0] || fullName || "Tenant";
}

async function safeGetAll(sheets: any, table: string): Promise<Row[]> {
  try {
    return (await sheets.getAll(table)) as Row[];
  } catch {
    return [];
  }
}

export async function getTenantHomeData() {
  const user = await requireTenant();
  const tenantId = user.tenantId;

  const { sheets } = getAdapters();

  const [
    tenants,
    occupancies,
    apartments,
    properties,
    apartmentTypes,
    rents,
    bills,
    payments,
    allocations,
    settingsRows
  ] = await Promise.all([
    safeGetAll(sheets, "tenants"),
    safeGetAll(sheets, "occupancies"),
    safeGetAll(sheets, "apartments"),
    safeGetAll(sheets, "properties"),
    safeGetAll(sheets, "apartmentTypes"),
    safeGetAll(sheets, "rents"),
    safeGetAll(sheets, "bills"),
    safeGetAll(sheets, "payments"),
    safeGetAll(sheets, "allocations"),
    safeGetAll(sheets, "settings") // optional tab
  ]);

  const tenant = tenants.find((t) => s(t.tenant_id) === s(tenantId)) || {};
  const name = s(tenant.full_name) || s(tenantId);

  // Current active occupancy (pick latest start_date if multiple)
  const activeOccs = occupancies
    .filter((o) => s(o.tenant_id) === s(tenantId))
    .filter((o) => s(o.status).toLowerCase() === "active" && !s(o.end_date))
    .slice()
    .sort((a, b) => s(b.start_date).localeCompare(s(a.start_date)));

  const currentOcc = activeOccs[0] || null;

  // Apartment + Property + Type details
  const apartment = currentOcc
    ? apartments.find((a) => s(a.apartment_id) === s(currentOcc.apartment_id)) || null
    : null;

  const property = apartment
    ? properties.find((p) => s(p.property_id) === s(apartment.property_id)) || null
    : null;

  const aptType = apartment
    ? apartmentTypes.find((t) => s(t.apartment_type_id) === s(apartment.apartment_type_id)) || null
    : null;

  const apartmentDetails = currentOcc && apartment ? {
    occupancyId: s(currentOcc.occupancy_id),
    apartmentId: s(apartment.apartment_id),
    unitLabel: s(apartment.unit_label || apartment.apartment_id),
    propertyName: s(property?.name || apartment.property_id || ""),
    apartmentTypeName: s(aptType?.name || apartment.apartment_type_id || ""),
    yearlyRentAmount: n(aptType?.yearly_rent_amount),
    monthlyChargeAmount: n(aptType?.monthly_charge_amount),
    startDate: s(currentOcc.start_date)
  } : null;

  // Compute balances for THIS tenant across all their occupancies (history-aware)
  const tenantOccIds = new Set(
    occupancies
      .filter((o) => s(o.tenant_id) === s(tenantId))
      .map((o) => s(o.occupancy_id))
  );

  const tenantRents = rents.filter((r) => tenantOccIds.has(s(r.occupancy_id)));
  const tenantBills = bills.filter((b) => tenantOccIds.has(s(b.occupancy_id)));
  const tenantPayments = payments.filter((p) => s(p.tenant_id) === s(tenantId));

  const rentApplied = new Map<string, number>();
  const billApplied = new Map<string, number>();

  for (const a of allocations) {
    const amt = n(a.amount_applied);
    const rid = s(a.rent_id);
    const bid = s(a.bill_id);
    if (rid) rentApplied.set(rid, (rentApplied.get(rid) ?? 0) + amt);
    if (bid) billApplied.set(bid, (billApplied.get(bid) ?? 0) + amt);
  }

  const rentExpected = tenantRents.reduce((sum, r) => sum + n(r.expected_amount), 0);
  const rentPaidApplied = tenantRents.reduce((sum, r) => sum + (rentApplied.get(s(r.rent_id)) ?? 0), 0);
  const rentBalance = Math.max(0, rentExpected - rentPaidApplied);

  const billExpected = tenantBills.reduce((sum, b) => sum + n(b.expected_amount), 0);
  const billPaidApplied = tenantBills.reduce((sum, b) => sum + (billApplied.get(s(b.bill_id)) ?? 0), 0);
  const billBalance = Math.max(0, billExpected - billPaidApplied);

  const totalBalance = rentBalance + billBalance;

  // Settings (key/value)
  const settings = new Map<string, string>();
  for (const row of settingsRows) {
    const k = s(row.key);
    const v = s(row.value);
    if (k) settings.set(k, v);
  }

  const paymentDetails = {
    accountName: settings.get("payment_account_name") || "",
    accountNumber: settings.get("payment_account_number") || "",
    bankName: settings.get("payment_bank_name") || "",
    note: settings.get("payment_note") || ""
  };

  const adminContact = {
    whatsappE164: settings.get("admin_whatsapp_e164") || "",
    phoneE164: settings.get("admin_phone_e164") || "",
    email: settings.get("admin_email") || ""
  };

  return {
    tenantId,
    tenantName: name,
    tenantFirstName: firstName(name),
    apartmentDetails,
    balances: {
      rentBalance,
      billBalance,
      totalBalance
    },
    paymentDetails,
    adminContact
  };
}
