export interface Rent {
  rent_id: string;
  apartment_id: string;
  occupancy_id: string;
  rent_period_start: string;
  rent_period_end: string;
  expected_amount: number;
  due_date: string;
  status: "unpaid" | "part_paid" | "paid";
  created_at: string;
}
