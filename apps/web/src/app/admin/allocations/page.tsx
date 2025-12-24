"use client";

import { useEffect, useMemo, useState } from "react";
import { allocatePayment } from "@/app/actions/allocations";
import { getAllocationUxData, PaymentOption, ChargeOption } from "@/app/actions/admin-ux";

type Target = { kind: "rent" | "bill"; id: string };

export default function AdminAllocationsPage() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentOption[]>([]);
  const [rents, setRents] = useState<ChargeOption[]>([]);
  const [bills, setBills] = useState<ChargeOption[]>([]);

  const [paymentId, setPaymentId] = useState("");
  const [targetKind, setTargetKind] = useState<"rent" | "bill">("rent");
  const [targetId, setTargetId] = useState("");
  const [amountApplied, setAmountApplied] = useState("");

  async function refresh() {
    setLoading(true);
    try {
      const data = await getAllocationUxData();
      setPayments(data.paymentOptions);
      setRents(data.rentOptions);
      setBills(data.billOptions);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const selectedPayment = useMemo(
    () => payments.find((p) => p.id === paymentId) || null,
    [payments, paymentId]
  );

  const targets = useMemo(() => (targetKind === "rent" ? rents : bills), [targetKind, rents, bills]);

  const selectedTarget = useMemo(
    () => targets.find((t) => t.id === targetId) || null,
    [targets, targetId]
  );

  async function submit() {
    if (!paymentId) return alert("Select a verified payment");
    if (!targetId) return alert("Select a rent/bill to allocate to");
    if (!amountApplied) return alert("Enter allocation amount");

    const amt = Number(amountApplied);
    if (!Number.isFinite(amt) || amt <= 0) return alert("Invalid allocation amount");

    // UX protection (server will accept; this prevents mistakes)
    if (selectedTarget && amt > selectedTarget.balance) {
      return alert(`Amount exceeds remaining balance (₦${selectedTarget.balance})`);
    }
    if (selectedPayment && amt > selectedPayment.amount) {
      // NOTE: this is not “remaining payment” (we haven't enforced multi-allocation sum here yet)
      // but it prevents obvious over-allocation against single payment amount.
      return alert(`Amount exceeds payment amount (₦${selectedPayment.amount})`);
    }

    await allocatePayment({
      paymentId,
      amountApplied: amt,
      rentId: targetKind === "rent" ? targetId : undefined,
      billId: targetKind === "bill" ? targetId : undefined
    });

    setAmountApplied("");
    alert("Allocation created");
    await refresh();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Allocations</h1>
      <p className="text-sm text-gray-700">
        Allocate a <b>verified</b> payment to an <b>open</b> Rent or Bill. Balances are shown to prevent mistakes.
      </p>

      <section className="rounded border bg-white p-4 space-y-3">
        {loading && <div className="text-sm text-gray-600">Loading options...</div>}

        <div className="space-y-1">
          <label className="text-sm">Verified Payment</label>
          <select className="w-full border p-2" value={paymentId} onChange={(e) => setPaymentId(e.target.value)}>
            <option value="">Select a verified payment</option>
            {payments.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-sm">Target Type</label>
            <select className="w-full border p-2" value={targetKind} onChange={(e) => {
              setTargetKind(e.target.value as any);
              setTargetId("");
            }}>
              <option value="rent">Rent</option>
              <option value="bill">Bill/Charge</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm">Target Record</label>
            <select className="w-full border p-2" value={targetId} onChange={(e) => setTargetId(e.target.value)}>
              <option value="">Select target</option>
              {targets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm">Amount to Apply</label>
          <input
            className="w-full border p-2"
            placeholder="e.g. 50000"
            value={amountApplied}
            onChange={(e) => setAmountApplied(e.target.value)}
          />
        </div>

        {selectedTarget && (
          <div className="text-xs text-gray-700 rounded bg-gray-50 p-3">
            <div><b>Target Balance:</b> ₦{selectedTarget.balance}</div>
            <div><b>Expected:</b> ₦{selectedTarget.expected} | <b>Applied:</b> ₦{selectedTarget.applied}</div>
          </div>
        )}

        <button className="rounded bg-black px-4 py-2 text-white" onClick={submit}>
          Create Allocation
        </button>
      </section>
    </div>
  );
}
