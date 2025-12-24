import { getAdapters } from "../adapters";
import { resolveAllocations } from "../domain/allocation-resolver";

export class DebtService {
  async outstandingByApartment() {
    const { sheets } = getAdapters();

    const rents = await sheets.getAll("rents");
    const bills = await sheets.getAll("bills");
    const allocations = await sheets.getAll("allocations");

    const rentLedger = resolveAllocations(
      rents,
      allocations,
      "rent_id",
      "rent_id"
    );

    const billLedger = resolveAllocations(
      bills,
      allocations,
      "bill_id",
      "bill_id"
    );

    const byApartment: Record<string, number> = {};

    for (const r of rentLedger) {
      const bal = Number(r.expected_amount) - Number(r.applied_amount);
      byApartment[r.apartment_id] =
        (byApartment[r.apartment_id] ?? 0) + bal;
    }

    for (const b of billLedger) {
      const bal = Number(b.expected_amount) - Number(b.applied_amount);
      byApartment[b.apartment_id] =
        (byApartment[b.apartment_id] ?? 0) + bal;
    }

    return byApartment;
  }
}
