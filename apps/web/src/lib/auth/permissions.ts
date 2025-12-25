export const PERMS = {
  MANAGE_SETUP: "manage_setup",
  MANAGE_OCCUPANCY: "manage_occupancy",
  MANAGE_RENT: "manage_rent",
  MANAGE_BILLS: "manage_bills",
  MANAGE_PAYMENTS: "manage_payments",
  VERIFY_PAYMENTS: "verify_payments",
  MANAGE_ALLOCATIONS: "manage_allocations",
  VIEW_STATEMENTS: "view_statements",
  MANAGE_REMINDERS: "manage_reminders",
  MANAGE_SETTINGS: "manage_settings",
  MANAGE_ADMIN_USERS: "manage_admin_users"
} as const;

export type Permission = (typeof PERMS)[keyof typeof PERMS];
