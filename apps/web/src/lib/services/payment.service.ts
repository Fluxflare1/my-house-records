import { getAdapters } from "../adapters";
import { Payment } from "../types/payment";

export class PaymentService {
  async record(payment: Payment) {
    const { sheets } = getAdapters();
    await sheets.appendRow("payments", Object.values(payment));
  }
}
