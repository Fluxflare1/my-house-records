"use client";

import { useState } from "react";
import { generateDebtorsReport } from "@/app/actions/reminders";

export default function AdminRemindersPage() {
  const [notifyTenants, setNotifyTenants] = useState(false);
  const [notifyAdmin, setNotifyAdmin] = useState(true);
  const [limit, setLimit] = useState("50");
  const [result, setResult] = useState<any>(null);

  async function run() {
    const lim = Number(limit);
    if (!Number.isFinite(lim) || lim <= 0) return alert("Invalid limit");

    const res = await generateDebtorsReport({
      notifyTenants,
      notifyAdmin,
      limit: lim
    });
    setResult(res);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reminders</h1>
      <p className="text-sm text-gray-700">
        Generate a “who owes” report based on active occupancies. Optional: notify tenants and/or admin.
      </p>

      <section className="rounded border bg-white p-4 space-y-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={notifyTenants} onChange={(e) => setNotifyTenants(e.target.checked)} />
          Notify tenants (WhatsApp/Email if enabled)
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={notifyAdmin} onChange={(e) => setNotifyAdmin(e.target.checked)} />
          Notify admin (WhatsApp/Email if enabled)
        </label>

        <div className="space-y-1">
          <label className="text-sm">Limit</label>
          <input className="w-full border p-2" value={limit} onChange={(e) => setLimit(e.target.value)} />
        </div>

        <button className="rounded bg-black px-4 py-2 text-white" onClick={run}>
          Run Debtors Report
        </button>
      </section>

      {result && (
        <section className="rounded border bg-white p-4 space-y-3">
          <h2 className="font-semibold">Result</h2>
          <div className="text-sm">Count: {result.count}</div>

          <details className="text-sm">
            <summary className="cursor-pointer font-semibold">Summary Text</summary>
            <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs">
              {result.summaryText}
            </pre>
          </details>

          <details className="text-sm">
            <summary className="cursor-pointer font-semibold">Full JSON</summary>
            <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </section>
      )}
    </div>
  );
}
