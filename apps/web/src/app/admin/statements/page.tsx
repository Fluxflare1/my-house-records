"use client";

import { useState } from "react";
import { getApartmentStatement, getTenantStatement } from "@/app/actions/statements";

export default function AdminStatementsPage() {
  const [apartmentId, setApartmentId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [result, setResult] = useState<any>(null);

  async function fetchApartment() {
    if (!apartmentId) return alert("Apartment ID required");
    const data = await getApartmentStatement(apartmentId);
    setResult(data);
  }

  async function fetchTenant() {
    if (!tenantId) return alert("Tenant ID required");
    const data = await getTenantStatement(tenantId);
    setResult(data);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Statements</h1>

      <section className="rounded border bg-white p-4 space-y-3">
        <h2 className="font-semibold">Apartment Statement</h2>
        <input className="w-full border p-2" placeholder="Apartment ID" value={apartmentId} onChange={e => setApartmentId(e.target.value)} />
        <button className="rounded bg-black px-4 py-2 text-white" onClick={fetchApartment}>
          Get Apartment Statement
        </button>
      </section>

      <section className="rounded border bg-white p-4 space-y-3">
        <h2 className="font-semibold">Tenant Statement (by occupancy history)</h2>
        <input className="w-full border p-2" placeholder="Tenant ID" value={tenantId} onChange={e => setTenantId(e.target.value)} />
        <button className="rounded bg-black px-4 py-2 text-white" onClick={fetchTenant}>
          Get Tenant Statement
        </button>
      </section>

      {result && (
        <section className="rounded border bg-white p-4 space-y-2">
          <h2 className="font-semibold">Result</h2>
          <pre className="overflow-auto rounded bg-gray-100 p-3 text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}
