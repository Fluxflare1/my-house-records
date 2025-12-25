"use client";

import { useEffect, useMemo, useState } from "react";
import { allocatePayment } from "@/app/actions/allocations";
import { getAllocationUxData, PaymentOption, ChargeOption } from "@/app/actions/admin-ux";
import { SearchableSelect } from "@/components/common/SearchableSelect";

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

  const paymentOptions = useMemo(
    () => payments.map((p) => ({ value: p.id, label: p.label })),
    [payments]
  );

  const targets = useMemo(() => (targetKind === "rent" ? rents : bills), [targetKind, rents, bills]);
  const targetOptions = useMemo(
    () => targets.map((t) => ({ value: t.id, label: t.label })),
    [targets]
  );

  const selectedPayment = useMemo(
    () => payments.find((p) => p.id === paymentId) || null,
    [payments, paymentId]
  );

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

    if (selectedTarget && amt > selectedTarget.balance) {
      return alert(`Amount exceeds remaining balance (₦${selectedTarget.balance})`);
    }
    if (selectedPayment && amt > selectedPayment.amount) {
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
        Allocate a <b>verified</b> payment to an <b>open</b> Rent or Bill. Use search to find records fast.
      </p>

      <section className="rounded border bg-white p-4 space-y-3">
        {loading && <div className="text-sm text-gray-600">Loading options...</div>}

        <SearchableSelect
          label="Verified Payment"
          value={paymentId}
          onChange={setPaymentId}
          options={paymentOptions}
          placeholder="Select a verified payment"
          disabled={loading}
          searchPlaceholder="Search payments..."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-sm">Target Type</label>
            <select
              className="w-full border p-2"
              value={targetKind}
              onChange={(e) => {
                setTargetKind(e.target.value as any);
                setTargetId("");
              }}
              disabled={loading}
            >
              <option value="rent">Rent</option>
              <option value="bill">Bill/Charge</option>
            </select>
          </div>

          <SearchableSelect
            label="Target Record"
            value={targetId}
            onChange={setTargetId}
            options={targetOptions}
            placeholder="Select target"
            disabled={loading}
            searchPlaceholder={`Search ${targetKind}s...`}
          />
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

        <button className="rounded border px-4 py-2 text-sm" onClick={refresh}>
          Refresh Options
        </button>
      </section>
    </div>
  );
}
