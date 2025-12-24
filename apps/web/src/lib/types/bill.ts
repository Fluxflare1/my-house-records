export interface Bill {
  bill_id: string;
  apartment_id: string;
  occupancy_id: string;
  bill_period_start: string;
  bill_period_end: string;
  expected_amount: number;
  due_date: string;
  status: "unpaid" | "part_paid" | "paid";
  created_at: string;
}
