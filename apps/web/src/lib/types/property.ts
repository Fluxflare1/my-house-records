export interface Property {
  property_id: string;
  name: string;
  address: string;
  status: "active" | "inactive";
  created_at: string;
}
