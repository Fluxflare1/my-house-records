export const SHEET_SCHEMAS: Record<string, string[]> = {
  properties: [
    "property_id",
    "name",
    "address",
    "status",
    "created_at"
  ],

  apartment_types: [
    "apartment_type_id",
    "name",
    "yearly_rent_amount",
    "monthly_charge_amount",
    "active",
    "created_at"
  ],

  apartments: [
    "apartment_id",
    "property_id",
    "apartment_type_id",
    "unit_label",
    "status",
    "created_at"
  ],

  tenants: [
    "tenant_id",
    "full_name",
    "phone",
    "email",
    "status",
    "created_at"
  ],

  occupancies: [
    "occupancy_id",
    "apartment_id",
    "tenant_id",
    "start_date",
    "end_date",
    "status",
    "created_at"
  ],

  rents: [
    "rent_id",
    "apartment_id",
    "occupancy_id",
    "rent_period_start",
    "rent_period_end",
    "expected_amount",
    "due_date",
    "status",
    "created_at"
  ],

  bills: [
    "bill_id",
    "apartment_id",
    "occupancy_id",
    "bill_period_start",
    "bill_period_end",
    "expected_amount",
    "due_date",
    "status",
    "created_at"
  ],

  payments: [
    "payment_id",
    "apartment_id",
    "tenant_id",
    "payment_date",
    "amount",
    "receipt_drive_file_url",
    "verification_status",
    "pos_reference",
    "created_at"
  ],

  allocations: [
    "allocation_id",
    "payment_id",
    "rent_id",
    "bill_id",
    "amount_applied",
    "created_at"
  ],

  documents: [
    "document_id",
    "entity_type",
    "entity_id",
    "drive_file_url",
    "created_at"
  ]
};
