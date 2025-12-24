"use client";

import { useEffect, useState } from "react";
import { getReferenceData, RefOption } from "@/app/actions/reference";
import { recordPayment, setPaymentVerification } from "@/app/actions/payments";

export default function AdminPaymentsPage() {
  const [apartments, setApartments] = useState<RefOption[]>([]);
  const [tenants, setTenants] = useState<RefOption[]>([]);

  // Record payment form
  const [apartmentId, setApartmentId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [amount, setAmount] = useState("");
  const [posRef, setPosRef] = useState("");

  // Verify form
  const [verifyPaymentId, setVerifyPaymentId] = useState("");
  const [verifyStatus, setVerifyStatus] = useState<"verified" | "rejected">("verified");

  async function refresh() {
    const ref = await getReferenceData();
    setApartments(ref.apartments);
    setTenants(ref.tenants);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function submitRecord() {
    if (!apartmentId || !paymentDate || !amount) return alert("Apartment, date, amount required");
    await recordPayment({
      apartmentId,
      tenantId: tenantId || undefined,
      paymentDate,
      amount: Number(amount),
      posReference: posRef || undefined
    });
    setAmount("");
    setPosRef("");
    alert("Payment recorded as PENDING verification");
  }

  async function submitVerify() {
    if (!verifyPaymentId) return alert("Payment ID required");
    await setPaymentVerification({ paymentId: verifyPaymentId, status: verifyStatus });
    setVerifyPaymentId("");
    alert(`Payment marked as ${verifyStatus}`);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Payments</h1>

      <section className="rounded border bg-white p-4 space-y-3">
        <h2 className="font-semibold">Record Payment (Manual POS verification)</h2>

        <select className="w-full border p-2" value={apartmentId} onChange={e => setApartmentId(e.target.value)}>
          <option value="">Select apartment</option>
          {apartments.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
        </select>

        <select className="w-full border p-2" value={tenantId} onChange={e => setTenantId(e.target.value)}>
          <option value="">Select tenant (optional)</option>
          {tenants.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>

        <input type="date" className="w-full border p-2" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
        <input className="w-full border p-2" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
        <input className="w-full border p-2" placeholder="POS reference (optional)" value={posRef} onChange={e => setPosRef(e.target.value)} />

        <button className="rounded bg-black px-4 py-2 text-white" onClick={submitRecord}>
          Record Payment
        </button>
      </section>

      <section className="rounded border bg-white p-4 space-y-3">
        <h2 className="font-semibold">Verify / Reject Payment</h2>

        <input
          className="w-full border p-2"
          placeholder="Payment ID"
          value={verifyPaymentId}
          onChange={e => setVerifyPaymentId(e.target.value)}
        />

        <select className="w-full border p-2" value={verifyStatus} onChange={e => setVerifyStatus(e.target.value as any)}>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>

        <button className="rounded bg-black px-4 py-2 text-white" onClick={submitVerify}>
          Update Verification
        </button>
      </section>
    </div>
  );
}
