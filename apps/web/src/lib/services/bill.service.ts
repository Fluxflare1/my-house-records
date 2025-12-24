import { getAdapters } from "../adapters";
import { Bill } from "../types/bill";

export class BillService {
  async generate(bill: Bill) {
    const { sheets } = getAdapters();
    await sheets.appendRow("bills", Object.values(bill));
  }
}
