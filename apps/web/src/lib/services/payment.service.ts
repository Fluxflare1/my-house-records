import { getAdapters } from "../adapters";

export class PaymentService {
  async recordPayment(data: any[]) {
    const { sheets } = getAdapters();
    await sheets.appendRow("payments", data);
  }
}
