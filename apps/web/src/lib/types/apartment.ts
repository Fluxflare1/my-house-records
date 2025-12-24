export interface Apartment {
  apartment_id: string;
  property_id: string;
  apartment_type_id: string;
  unit_label: string;
  status: "vacant" | "occupied" | "inactive";
  created_at: string;
}
