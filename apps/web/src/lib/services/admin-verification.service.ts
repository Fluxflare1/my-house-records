import { getAdapters } from "../adapters";

export class AdminVerificationService {
  async verifyPayment(paymentId: string, status: "verified" | "rejected") {
    const { sheets } = getAdapters();

    await sheets.updateRow(
      "payments",
      "payment_id",
      paymentId,
      { verification_status: status }
    );
  }
}
