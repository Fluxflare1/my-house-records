import { getAdapters } from "../adapters";
import { resolveAllocations } from "../domain/allocation-resolver";
import { calculateBalance } from "../domain/ledger";

export class StatementService {

  async apartmentStatement(apartmentId: string) {
    const { sheets } = getAdapters();

    const rents = (await sheets.getAll("rents"))
      .filter(r => r.apartment_id === apartmentId);

    const bills = (await sheets.getAll("bills"))
      .filter(b => b.apartment_id === apartmentId);

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

    return {
      rent: {
        records: rentLedger,
        summary: calculateBalance(
          rentLedger.map(r => ({
            id: r.rent_id,
            expected: Number(r.expected_amount),
            applied: Number(r.applied_amount)
          }))
        )
      },
      bills: {
        records: billLedger,
        summary: calculateBalance(
          billLedger.map(b => ({
            id: b.bill_id,
            expected: Number(b.expected_amount),
            applied: Number(b.applied_amount)
          }))
        )
      }
    };
  }

  async tenantStatement(tenantId: string) {
    const { sheets } = getAdapters();

    const occupancies = (await sheets.getAll("occupancies"))
      .filter(o => o.tenant_id === tenantId);

    const occIds = occupancies.map(o => o.occupancy_id);

    const rents = (await sheets.getAll("rents"))
      .filter(r => occIds.includes(r.occupancy_id));

    const bills = (await sheets.getAll("bills"))
      .filter(b => occIds.includes(b.occupancy_id));

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

    return {
      occupancies,
      rent: {
        records: rentLedger,
        summary: calculateBalance(
          rentLedger.map(r => ({
            id: r.rent_id,
            expected: Number(r.expected_amount),
            applied: Number(r.applied_amount)
          }))
        )
      },
      bills: {
        records: billLedger,
        summary: calculateBalance(
          billLedger.map(b => ({
            id: b.bill_id),
            expected: Number(b.expected_amount),
            applied: Number(b.applied_amount)
          }))
        )
      }
    };
  }
}
