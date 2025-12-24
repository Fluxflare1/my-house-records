export interface Occupancy {
  occupancy_id: string;
  apartment_id: string;
  tenant_id: string;
  start_date: string;
  end_date?: string;
  status: "active" | "ended";
  created_at: string;
}
