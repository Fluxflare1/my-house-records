"use client";

import { useEffect, useState } from "react";
import { getApartmentStatement, getTenantStatement } from "@/app/actions/statements";
import { getReferenceData, RefOption } from "@/app/actions/reference";

export default function AdminStatementsPage() {
  const [apartments, setApartments] = useState<RefOption[]>([]);
  const [tenants, setTenants] = useState<RefOption[]>([]);
  const [apartmentId, setApartmentId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [result, setResult] = useState<any>(null);

  async function loadRefs() {
    const ref = await getReferenceData();
    setApartments(ref.apartments);
    setTenants(ref.tenants);
  }

  useEffect(() => {
    loadRefs();
  }, []);

  async function fetchApartment() {
    if (!apartmentId) return alert("Select an apartment");
    const data = await getApartmentStatement(apartmentId);
    setResult(data);
  }

  async function fetchTenant() {
    if (!tenantId) return alert("Select a tenant");
    const data = await getTenantStatement(tenantId);
    setResult(data);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Statements</h1>

      <section className="rounded border bg-white p-4 space-y-3">
        <h2 className="font-semibold">Apartment Statement</h2>
        <select className="w-full border p-2" value={apartmentId} onChange={(e) => setApartmentId(e.target.value)}>
          <option value="">Select apartment</option>
          {apartments.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
        <button className="rounded bg-black px-4 py-2 text-white" onClick={fetchApartment}>
          Get Apartment Statement
        </button>
      </section>

      <section className="rounded border bg-white p-4 space-y-3">
        <h2 className="font-semibold">Tenant Statement</h2>
        <select className="w-full border p-2" value={tenantId} onChange={(e) => setTenantId(e.target.value)}>
          <option value="">Select tenant</option>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
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
