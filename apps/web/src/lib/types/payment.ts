export interface Payment {
  payment_id: string;
  apartment_id: string;
  tenant_id?: string;
  payment_date: string;
  amount: number;
  receipt_drive_file_url?: string;
  verification_status: "pending" | "verified" | "rejected";
  pos_reference?: string;
  created_at: string;
}
