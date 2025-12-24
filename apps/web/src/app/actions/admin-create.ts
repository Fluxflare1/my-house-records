"use server";

import { nowISO } from "@/lib/utils/time";
import { generateId } from "@/lib/utils/id";

import { PropertyService } from "@/lib/services/property.service";
import { ApartmentTypeService } from "@/lib/services/apartment-type.service";
import { ApartmentService } from "@/lib/services/apartment.service";
import { TenantService } from "@/lib/services/tenant.service";
import { OccupancyService } from "@/lib/services/occupancy.service";
import { RentService } from "@/lib/services/rent.service";
import { BillService } from "@/lib/services/bill.service";
import { PaymentService } from "@/lib/services/payment.service";
import { AllocationService } from "@/lib/services/allocation.service";
import { NotificationService } from "@/lib/notifications/notification.service";
import { LookupService } from "@/lib/services/lookup.service";

export async function createPropertyAction(input: { name: string; address: string }) {
  const svc = new PropertyService();
  await svc.create({
    property_id: generateId("property"),
    name: input.name,
    address: input.address,
    status: "active",
    created_at: nowISO(),
  });
}

export async function createApartmentTypeAction(input: {
  name: string;
  yearlyRent: number;
  monthlyCharge: number;
}) {
  const svc = new ApartmentTypeService();
  await svc.create({
    apartment_type_id: generateId("apt_type"),
    name: input.name,
    yearly_rent_amount: input.yearlyRent,
    monthly_charge_amount: input.monthlyCharge,
    active: true,
    created_at: nowISO(),
  });
}

export async function createApartmentAction(input: {
  propertyId: string;
  apartmentTypeId: string;
  unitLabel: string;
}) {
  const svc = new ApartmentService();
  await svc.create({
    apartment_id: generateId("apt"),
    property_id: input.propertyId,
    apartment_type_id: input.apartmentTypeId,
    unit_label: input.unitLabel,
    status: "vacant",
    created_at: nowISO(),
  });
}

export async function createTenantAction(input: {
  fullName: string;
  phone: string;
  email?: string;
}) {
  const svc = new TenantService();
  await svc.create({
    tenant_id: generateId("tenant"),
    full_name: input.fullName,
    phone: input.phone,
    email: input.email,
    status: "active",
    created_at: nowISO(),
  });
}

export async function bondTenantAction(input: {
  apartmentId: string;
  tenantId: string;
  startDate: string;
}) {
  const svc = new OccupancyService();
  await svc.bond({
    occupancy_id: generateId("occ"),
    apartment_id: input.apartmentId,
    tenant_id: input.tenantId,
    start_date: input.startDate,
    status: "active",
    created_at: nowISO(),
  });
}

export async function generateRentAction(input: {
  apartmentId: string;
  occupancyId: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  dueDate: string;
}) {
  const svc = new RentService();
  await svc.generate({
    rent_id: generateId("rent"),
    apartment_id: input.apartmentId,
    occupancy_id: input.occupancyId,
    rent_period_start: input.periodStart,
    rent_period_end: input.periodEnd,
    expected_amount: input.amount,
    due_date: input.dueDate,
    status: "unpaid",
    created_at: nowISO(),
  });

  // Notification after rent generation
  const lookup = new LookupService();
  const notif = new NotificationService();

  const occ = await lookup.getOccupancyById(input.occupancyId);
  if (occ) {
    const tenant = await lookup.getTenantById(String(occ.tenant_id));
    if (tenant?.email) {
      await notif.notifyEmail(
        String(tenant.email),
        "New Rent Posted",
        `A new rent has been posted for your apartment. Amount: ${input.amount}. Due: ${input.dueDate}.`
      );
    }
    if (tenant?.phone) {
      await notif.notifyWhatsApp(
        String(tenant.phone),
        `New rent posted. Amount: ${input.amount}. Due: ${input.dueDate}.`
      );
    }
  }
}

export async function generateBillAction(input: {
  apartmentId: string;
  occupancyId: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  dueDate: string;
}) {
  const svc = new BillService();
  await svc.generate({
    bill_id: generateId("bill"),
    apartment_id: input.apartmentId,
    occupancy_id: input.occupancyId,
    bill_period_start: input.periodStart,
    bill_period_end: input.periodEnd,
    expected_amount: input.amount,
    due_date: input.dueDate,
    status: "unpaid",
    created_at: nowISO(),
  });

  // Notification after bill generation
  const lookup = new LookupService();
  const notif = new NotificationService();

  const occ = await lookup.getOccupancyById(input.occupancyId);
  if (occ) {
    const tenant = await lookup.getTenantById(String(occ.tenant_id));
    if (tenant?.email) {
      await notif.notifyEmail(
        String(tenant.email),
        "New Monthly Charges Posted",
        `New monthly charges have been posted for your apartment. Amount: ${input.amount}. Due: ${input.dueDate}.`
      );
    }
    if (tenant?.phone) {
      await notif.notifyWhatsApp(
        String(tenant.phone),
        `New monthly charges posted. Amount: ${input.amount}. Due: ${input.dueDate}.`
      );
    }
  }
}

export async function recordPaymentAction(input: {
  apartmentId: string;
  tenantId?: string;
  paymentDate: string;
  amount: number;
  receiptDriveFileUrl?: string;
  posReference?: string;
}) {
  const svc = new PaymentService();
  await svc.record({
    payment_id: generateId("pay"),
    apartment_id: input.apartmentId,
    tenant_id: input.tenantId,
    payment_date: input.paymentDate,
    amount: input.amount,
    receipt_drive_file_url: input.receiptDriveFileUrl,
    verification_status: "pending",
    pos_reference: input.posReference,
    created_at: nowISO(),
  });
}

export async function allocatePaymentAction(input: {
  paymentId: string;
  rentId?: string;
  billId?: string;
  amountApplied: number;
}) {
  const svc = new AllocationService();
  await svc.allocate({
    allocation_id: generateId("alloc"),
    payment_id: input.paymentId,
    rent_id: input.rentId,
    bill_id: input.billId,
    amount_applied: input.amountApplied,
    created_at: nowISO(),
  });
}
