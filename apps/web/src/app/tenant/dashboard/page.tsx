"use client";

import { useState } from "react";
import { getTenantDashboard } from "@/app/actions/tenant";

function n(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

export default function TenantDashboardPage() {
  const [data, setData] = useState<any>(null);

  async function load() {
    try {
      const res = await getTenantDashboard();
      setData(res);
    } catch (e: any) {
      alert(e?.message || "Failed to load");
    }
  }

  const summary = (() => {
    if (!data) return null;

    // compute applied amounts from allocations (rent/bill)
    const allocs = data.allocations || [];
    const rentApplied = new Map<string, number>();
    const billApplied = new Map<string, number>();

    for (const a of allocs) {
      const amt = n(a.amount_applied);
      const rid = String(a.rent_id || "");
      const bid = String(a.bill_id || "");
      if (rid) rentApplied.set(rid, (rentApplied.get(rid) ?? 0) + amt);
      if (bid) billApplied.set(bid, (billApplied.get(bid) ?? 0) + amt);
    }

    const rents = (data.rents || []).map((r: any) => {
      const expected = n(r.expected_amount);
      const applied = rentApplied.get(String(r.rent_id)) ?? 0;
      return { expected, applied, balance: expected - applied };
    });

    const bills = (data.bills || []).map((b: any) => {
      const expected = n(b.expected_amount);
      const applied = billApplied.get(String(b.bill_id)) ?? 0;
      return { expected, applied, balance: expected - applied };
    });

    const rentExpected = rents.reduce((s, x) => s + x.expected, 0);
    const rentAppliedSum = rents.reduce((s, x) => s + x.applied, 0);
    const rentBalance = rents.reduce((s, x) => s + x.balance, 0);

    const billExpected = bills.reduce((s, x) => s + x.expected, 0);
    const billAppliedSum = bills.reduce((s, x) => s + x.applied, 0);
    const billBalance = bills.reduce((s, x) => s + x.balance, 0);

    const paymentsTotal = (data.payments || []).reduce((s: number, p: any) => s + n(p.amount), 0);

    return {
      rentExpected,
      rentAppliedSum,
      rentBalance,
      billExpected,
      billAppliedSum,
      billBalance,
      paymentsTotal
    };
  })();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My Dashboard</h1>

      <section className="rounded border bg-white p-4 space-y-3">
        <button className="rounded bg-black px-4 py-2 text-white" onClick={load}>
          Load My Records
        </button>
      </section>

      {data && summary && (
        <section className="rounded border bg-white p-4 space-y-3">
          <h2 className="font-semibold">Summary</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded border p-3">
              <div className="font-semibold">Rent</div>
              <div>Expected: ₦{summary.rentExpected}</div>
              <div>Paid (applied): ₦{summary.rentAppliedSum}</div>
              <div className="font-semibold">Balance: ₦{summary.rentBalance}</div>
            </div>

            <div className="rounded border p-3">
              <div className="font-semibold">Bills/Charges</div>
              <div>Expected: ₦{summary.billExpected}</div>
              <div>Paid (applied): ₦{summary.billAppliedSum}</div>
              <div className="font-semibold">Balance: ₦{summary.billBalance}</div>
            </div>

            <div className="rounded border p-3 sm:col-span-2">
              <div className="font-semibold">Payments Recorded</div>
              <div>Total payments amount: ₦{summary.paymentsTotal}</div>
              <div className="text-xs text-gray-600">
                (Totals include pending/rejected; allocations apply only when admin verifies and allocates.)
              </div>
            </div>
          </div>

          <details className="text-sm">
            <summary className="cursor-pointer font-semibold">View Raw Data (JSON)</summary>
            <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </section>
      )}
    </div>
  );
}
