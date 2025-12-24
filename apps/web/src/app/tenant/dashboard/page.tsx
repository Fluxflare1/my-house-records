"use client";

import { useState } from "react";
import { getTenantDashboard } from "@/app/actions/tenant";

export default function TenantDashboardPage() {
  const [tenantId, setTenantId] = useState("");
  const [data, setData] = useState<any>(null);

  async function load() {
    if (!tenantId) return alert("Tenant ID required");
    const res = await getTenantDashboard(tenantId);
    setData(res);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My Dashboard</h1>

      <section className="rounded border bg-white p-4 space-y-3">
        <input
          className="w-full border p-2"
          placeholder="Enter Tenant ID"
          value={tenantId}
          onChange={(e) => setTenantId(e.target.value)}
        />
        <button className="rounded bg-black px-4 py-2 text-white" onClick={load}>
          Load My Records
        </button>
      </section>

      {data && (
        <section className="rounded border bg-white p-4 space-y-3">
          <h2 className="font-semibold">Results</h2>

          <div className="space-y-2 text-sm">
            <div><b>Occupancies:</b> {data.occupancies.length}</div>
            <div><b>Rents:</b> {data.rents.length}</div>
            <div><b>Bills:</b> {data.bills.length}</div>
            <div><b>Payments:</b> {data.payments.length}</div>
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
