"use client";

import { useEffect, useMemo, useState } from "react";
import { getReferenceData, RefOption } from "@/app/actions/reference";
import { recordPayment, setPaymentVerification } from "@/app/actions/payments";
import { getRecentPayments, RecentPayment } from "@/app/actions/admin-payments-ux";
import Link from "next/link";

export default function AdminPaymentsPage() {
  const [apartments, setApartments] = useState<RefOption[]>([]);
  const [tenants, setTenants] = useState<RefOption[]>([]);
  const [recent, setRecent] = useState<RecentPayment[]>([]);
  const [loading, setLoading] = useState(true);

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
    setLoading(true);
    try {
      const [ref, rec] = await Promise.all([getReferenceData(), getRecentPayments(20)]);
      setApartments(ref.apartments as any);
      setTenants(ref.tenants);
      setRecent(rec);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function submitRecord() {
    if (!apartmentId || !paymentDate || !amount) {
      return alert("Apartment, date, and amount are required");
    }
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return alert("Invalid amount");

    await recordPayment({
      apartmentId,
      tenantId: tenantId || undefined,
      paymentDate,
      amount: amt,
      posReference: posRef || undefined
    });

    setAmount("");
    setPosRef("");
    alert("Payment recorded as PENDING verification");
    await refresh();
  }

  async function submitVerify() {
    if (!verifyPaymentId) return alert("Payment ID required");
    await setPaymentVerification({ paymentId: verifyPaymentId, status: verifyStatus });
    setVerifyPaymentId("");
    alert(`Payment marked as ${verifyStatus}`);
    await refresh();
  }

  function pickFromRecent(p: RecentPayment) {
    setVerifyPaymentId(p.paymentId);
    const st = String(p.verificationStatus || "").toLowerCase();
    if (st === "verified") setVerifyStatus("verified");
    if (st === "rejected") setVerifyStatus("rejected");
  }

  const pendingWithReceiptCount = useMemo(() => {
    return recent.filter((p) => {
      const st = String(p.verificationStatus || "").toLowerCase();
      return st === "pending" && !!String(p.receiptUrl || "").trim();
    }).length;
  }, [recent]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Payments</h1>
          <p className="text-sm text-gray-700">
            Record payments, then verify on POS. Receipts uploaded by tenants appear in the verification queue.
          </p>
        </div>

        <div className="text-sm text-right">
          <div className="font-semibold">
            Pending with receipt: {pendingWithReceiptCount}
          </div>
          <Link className="underline" href="/admin/verification-queue">
            Open Verification Queue
          </Link>
        </div>
      </div>

      <section className="rounded border bg-white p-4 space-y-3">
        <h2 className="font-semibold">Record Payment (POS manual verification)</h2>

        <div className="space-y-1">
          <label className="text-sm">Apartment</label>
          <select className="w-full border p-2" value={apartmentId} onChange={(e) => setApartmentId(e.target.value)}>
            <option value="">Select apartment</option>
            {(apartments as any[]).map((a: any) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm">Tenant (optional)</label>
          <select className="w-full border p-2" value={tenantId} onChange={(e) => setTenantId(e.target.value)}>
            <option value="">Select tenant (optional)</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-sm">Payment Date</label>
            <input
              type="date"
              className="w-full border p-2"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm">Amount</label>
            <input
              className="w-full border p-2"
              placeholder="e.g. 200000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm">POS Reference (optional)</label>
          <input
            className="w-full border p-2"
            placeholder="POS ref"
            value={posRef}
            onChange={(e) => setPosRef(e.target.value)}
          />
        </div>

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
          onChange={(e) => setVerifyPaymentId(e.target.value)}
        />

        <select className="w-full border p-2" value={verifyStatus} onChange={(e) => setVerifyStatus(e.target.value as any)}>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>

        <button className="rounded bg-black px-4 py-2 text-white" onClick={submitVerify}>
          Update Verification
        </button>

        <div className="pt-3 border-t">
          <div className="text-sm font-semibold mb-2">Recent Payments</div>
          {loading && <div className="text-sm text-gray-600">Loading...</div>}

          <div className="space-y-2">
            {recent.map((p) => {
              const st = String(p.verificationStatus || "").toLowerCase();
              const pendingWithReceipt = st === "pending" && !!String(p.receiptUrl || "").trim();

              return (
                <button
                  key={p.paymentId}
                  className={`w-full text-left rounded border px-3 py-2 hover:bg-gray-50 ${
                    pendingWithReceipt ? "border-black" : ""
                  }`}
                  onClick={() => pickFromRecent(p)}
                  title="Click to fill Payment ID"
                >
                  <div className="text-sm">{p.label}</div>
                  {pendingWithReceipt && (
                    <div className="text-xs font-semibold">Pending — receipt attached (check queue)</div>
                  )}
                  {!pendingWithReceipt && p.receiptUrl && (
                    <div className="text-xs text-gray-600">Receipt attached</div>
                  )}
                </button>
              );
            })}

            {!loading && recent.length === 0 && (
              <div className="text-sm text-gray-600">No payments yet.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
