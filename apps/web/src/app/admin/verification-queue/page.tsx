"use client";

import { useEffect, useState } from "react";
import { getVerificationQueue, QueueItem } from "@/app/actions/admin-verification-queue";
import { setPaymentVerification } from "@/app/actions/payments";

export default function AdminVerificationQueuePage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const list = await getVerificationQueue(80);
      setItems(list);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function mark(paymentId: string, status: "verified" | "rejected") {
    if (!confirm(`Mark payment ${paymentId} as ${status.toUpperCase()}?`)) return;
    await setPaymentVerification({ paymentId, status });
    await refresh();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Verification Queue</h1>
      <p className="text-sm text-gray-700">
        Payments that are <b>PENDING</b> and have a <b>receipt attached</b>.
      </p>

      <section className="rounded border bg-white p-4 space-y-3">
        <button className="rounded border px-4 py-2 text-sm" onClick={refresh}>
          Refresh
        </button>

        {loading && <div className="text-sm text-gray-600">Loading...</div>}

        {!loading && items.length === 0 && (
          <div className="text-sm text-gray-600">No pending payments with receipts.</div>
        )}

        <div className="space-y-3">
          {items.map((p) => (
            <div key={p.paymentId} className="rounded border p-3 space-y-2">
              <div className="text-sm font-semibold">
                Payment {p.paymentId} — ₦{p.amount} — {p.paymentDate}
              </div>

              <div className="text-xs text-gray-700">
                <div><b>Apartment:</b> {p.apartmentLabel}</div>
                <div><b>Tenant:</b> {p.tenantName}</div>
                {p.posReference && <div><b>POS Ref:</b> {p.posReference}</div>}
                {p.createdAt && <div><b>Created:</b> {p.createdAt}</div>}
              </div>

              <div className="text-sm">
                <a className="underline" href={p.receiptUrl} target="_blank" rel="noreferrer">
                  Open Receipt
                </a>
              </div>

              <div className="flex gap-2">
                <button
                  className="rounded bg-black px-3 py-2 text-white text-sm"
                  onClick={() => mark(p.paymentId, "verified")}
                >
                  Verify
                </button>
                <button
                  className="rounded border px-3 py-2 text-sm"
                  onClick={() => mark(p.paymentId, "rejected")}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
