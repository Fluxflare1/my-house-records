export type SheetSpec = {
  title: string;
  headers: string[];
};

export const DRIVE_FOLDERS = ["receipts", "statements", "agreements", "exports"] as const;

export const SHEETS: SheetSpec[] = [
  {
    title: "properties",
    headers: ["property_id", "name", "address", "created_at", "updated_at"]
  },
  {
    title: "apartmentTypes",
    headers: [
      "apartment_type_id",
      "property_id",
      "name",
      "rent_amount",
      "monthly_charge_amount",
      "currency",
      "created_at",
      "updated_at"
    ]
  },
  {
    title: "apartments",
    headers: [
      "apartment_id",
      "property_id",
      "apartment_type_id",
      "label",
      "status",
      "created_at",
      "updated_at"
    ]
  },
  {
    title: "tenants",
    headers: ["tenant_id", "first_name", "last_name", "phone", "email", "is_active", "created_at", "updated_at"]
  },
  {
    title: "occupancies",
    headers: [
      "occupancy_id",
      "apartment_id",
      "tenant_id",
      "start_date",
      "end_date",
      "status",
      "created_at",
      "updated_at"
    ]
  },

  // Rent is separate (as you requested)
  {
    title: "rents",
    headers: [
      "rent_id",
      "occupancy_id",
      "apartment_id",
      "tenant_id",
      "rent_period_start",
      "rent_period_end",
      "amount_due",
      "amount_paid",
      "status",
      "created_at",
      "updated_at"
    ]
  },

  // Bills/Charges separate from rent
  {
    title: "bills",
    headers: [
      "bill_id",
      "occupancy_id",
      "apartment_id",
      "tenant_id",
      "bill_period",
      "bill_type",
      "amount_due",
      "amount_paid",
      "status",
      "created_at",
      "updated_at"
    ]
  },

  // Payments
  {
    title: "payments",
    headers: [
      "payment_id",
      "payer_type",
      "tenant_id",
      "apartment_id",
      "occupancy_id",
      "amount",
      "currency",
      "payment_date",
      "channel",
      "reference",
      "status",
      "created_at",
      "updated_at"
    ]
  },

  // Allocations
  {
    title: "allocations",
    headers: [
      "allocation_id",
      "payment_id",
      "target_type",
      "target_id",
      "amount",
      "created_at",
      "updated_at"
    ]
  },

  // Documents (Drive links)
  {
    title: "documents",
    headers: [
      "document_id",
      "document_type",
      "related_type",
      "related_id",
      "drive_file_id",
      "drive_url",
      "uploaded_by",
      "created_at"
    ]
  },

  // App settings (admin publishes account details etc.)
  {
    title: "settings",
    headers: ["key", "value", "updated_at"]
  },

  // RBAC admin users
  {
    title: "adminUsers",
    headers: ["admin_user_id", "email", "full_name", "role", "password_hash", "is_active", "created_at", "updated_at"]
  }
];
