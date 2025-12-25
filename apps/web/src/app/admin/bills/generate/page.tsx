"use client";

import { useState } from "react";
import { handleAdminClientError } from "@/lib/ui/admin-error";
import { generateMonthlyBills } from "@/app/actions/generate-monthly-bills";

function currentYM() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default function GenerateBillsPage() {
  const [billingMonth, setBillingMonth] = useState(currentYM());
  const [billName, setBillName] = useState("Monthly Charges");
  const [dueInDays, setDueInDays] = useState(7);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function run() {
    setBusy(true);
    setResult(null);
    try {
      const r = await generateMonthlyBills({ billingMonth, billName, dueInDays });
      setResult(r);
      alert(`Done. Created ${r.created}, skipped ${r.skipped}`);
    } catch (e: any) {
      if (handleAdminClientError(e)) return;
      alert(e?.message || "Failed to generate bills");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Generate Monthly Bills</h1>
        <p className="text-sm text-gray-700">
          Creates one bill per <b>active occupancy</b> for the selected month (no duplicates).
        </p>
      </div>

      <section className="rounded border bg-white p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="space-y-1">
            <label className="text-sm">Billing month (YYYY-MM)</label>
            <input className="w-full border p-2" value={billingMonth} onChange={(e) => setBillingMonth(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-sm">Bill name</label>
            <input className="w-full border p-2" value={billName} onChange={(e) => setBillName(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-sm">Due in days</label>
            <input className="w-full border p-2" type="number" value={dueInDays} onChange={(e) => setDueInDays(Number(e.target.value))} />
          </div>
        </div>

        <button className="rounded bg-black px-4 py-2 text-white text-sm" onClick={run} disabled={busy}>
          {busy ? "Generating..." : "Generate Bills"}
        </button>

        <div className="text-xs text-gray-600">
          Amount is derived from apartment type <b>monthly_charge_amount</b>.
        </div>
      </section>

      {result && (
        <details className="text-sm">
          <summary className="cursor-pointer font-semibold">View result (JSON)</summary>
          <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
