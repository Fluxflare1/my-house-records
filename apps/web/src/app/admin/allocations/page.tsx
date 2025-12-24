"use client";

import { useState } from "react";
import { allocatePayment } from "@/app/actions/allocations";

export default function AdminAllocationsPage() {
  const [paymentId, setPaymentId] = useState("");
  const [rentId, setRentId] = useState("");
  const [billId, setBillId] = useState("");
  const [amountApplied, setAmountApplied] = useState("");

  async function submit() {
    if (!paymentId || !amountApplied) return alert("Payment ID and amount required");

    // Enforce "either rent or bill" at UI level too
    const hasRent = rentId.trim().length > 0;
    const hasBill = billId.trim().length > 0;
    if (!hasRent && !hasBill) return alert("Provide either Rent ID or Bill ID");
    if (hasRent && hasBill) return alert("Provide only one: Rent ID OR Bill ID");

    await allocatePayment({
      paymentId,
      rentId: hasRent ? rentId : undefined,
      billId: hasBill ? billId : undefined,
      amountApplied: Number(amountApplied)
    });

    setAmountApplied("");
    alert("Allocation created");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Allocations</h1>

      <section className="rounded border bg-white p-4 space-y-3">
        <p className="text-sm text-gray-700">
          Allocations apply a payment to either a <b>Rent</b> record or a <b>Bill</b> record.
          This supports part payments and split payments.
        </p>

        <input className="w-full border p-2" placeholder="Payment ID" value={paymentId} onChange={e => setPaymentId(e.target.value)} />
        <input className="w-full border p-2" placeholder="Rent ID (optional)" value={rentId} onChange={e => setRentId(e.target.value)} />
        <input className="w-full border p-2" placeholder="Bill ID (optional)" value={billId} onChange={e => setBillId(e.target.value)} />
        <input className="w-full border p-2" placeholder="Amount Applied" value={amountApplied} onChange={e => setAmountApplied(e.target.value)} />

        <button className="rounded bg-black px-4 py-2 text-white" onClick={submit}>
          Create Allocation
        </button>
      </section>
    </div>
  );
}
