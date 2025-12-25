export type SheetDef = {
  name: string;
  headers: string[];
};

export const SHEETS: SheetDef[] = [
  {
    name: "properties",
    headers: ["property_id", "name", "address", "status", "created_at"]
  },
  {
    name: "apartment_types",
    headers: ["apartment_type_id", "name", "yearly_rent_amount", "monthly_charge_amount", "active", "created_at"]
  },
  {
    name: "apartments",
    headers: ["apartment_id", "property_id", "apartment_type_id", "unit_label", "status", "created_at"]
  },
  {
    name: "tenants",
    headers: ["tenant_id", "full_name", "phone", "email", "status", "created_at"]
  },
  {
    name: "occupancies",
    headers: ["occupancy_id", "apartment_id", "tenant_id", "start_date", "end_date", "status", "created_at"]
  },
  // rent is NOT a bill type (separate)
  {
    name: "rents",
    headers: ["rent_id", "occupancy_id", "period_start", "period_end", "due_date", "expected_amount", "status", "created_at"]
  },
  {
    name: "bills",
    headers: ["bill_id", "occupancy_id", "bill_name", "period_start", "period_end", "due_date", "expected_amount", "status", "created_at"]
  },
  {
    name: "payments",
    headers: ["payment_id", "apartment_id", "tenant_id", "payment_date", "amount", "receipt_drive_file_url", "verification_status", "pos_reference", "created_at"]
  },
  {
    name: "allocations",
    headers: ["allocation_id", "payment_id", "rent_id", "bill_id", "amount_applied", "created_at"]
  },
  {
    name: "documents",
    headers: ["document_id", "tenant_id", "apartment_id", "occupancy_id", "type", "drive_file_url", "created_at"]
  },

  // ✅ NEW: settings key/value for admin-controlled publishing
  {
    name: "settings",
    headers: ["key", "value"]
  },

  // ✅ NEW: RBAC admin users
  {
    name: "admin_users",
    headers: [
      "admin_user_id",
      "full_name",
      "email",
      "phone",
      "password_hash",
      "status",
      "permissions",
      "created_at"
    ]
  }
];
