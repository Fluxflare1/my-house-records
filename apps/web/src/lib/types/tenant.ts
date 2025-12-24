export interface Tenant {
  tenant_id: string;
  full_name: string;
  phone: string;
  email?: string;
  status: "active" | "inactive";
  created_at: string;
}
