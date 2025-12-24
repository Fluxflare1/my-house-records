"use client";

import { useState } from "react";

export default function PaymentHistoryPage() {
  const [paymentId, setPaymentId] = useState("");
  const [status, setStatus] = useState("");

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Payment History</h1>

      <input className="w-full border p-2" placeholder="Payment ID"
        value={paymentId} onChange={e => setPaymentId(e.target.value)} />

      <input className="w-full border p-2" placeholder="Verification Status"
        value={status} onChange={e => setStatus(e.target.value)} />
    </div>
  );
}
