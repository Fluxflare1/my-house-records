import { getAdapters } from "../adapters";

export class BillService {
  async recordBill(data: any[]) {
    const { sheets } = getAdapters();
    await sheets.appendRow("bills", data);
  }
}
