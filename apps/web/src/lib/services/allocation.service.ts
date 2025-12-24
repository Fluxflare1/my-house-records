import { getAdapters } from "../adapters";

export class AllocationService {
  async allocate(allocation: {
    allocation_id: string;
    payment_id: string;
    rent_id?: string;
    bill_id?: string;
    amount_applied: number;
    created_at: string;
  }) {
    if (!allocation.rent_id && !allocation.bill_id) {
      throw new Error("Allocation must reference rent or bill");
    }

    const { sheets } = getAdapters();
    await sheets.appendRow("allocations", Object.values(allocation));
  }
}
