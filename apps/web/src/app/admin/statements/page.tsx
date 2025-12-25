"use client";

import { useEffect, useState } from "react";
import { getApartmentStatement, getTenantStatement } from "@/app/actions/statements";
import { getReferenceData, RefOption } from "@/app/actions/reference";
import { computeSummary } from "@/lib/utils/statement-summary";

export default function AdminStatementsPage() {
  const [apartments, setApartments] = useState<RefOption[]>([]);
  const [tenants, setTenants] = useState<RefOption[]>([]);
  const [apartmentId, setApartmentId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [mode, setMode] = useState<"apartment" | "tenant">("apartment");

  async function loadRefs() {
    const ref = await getReferenceData();
    setApartments(ref.apartments);
    setTenants(ref.tenants);
  }

  useEffect(() => {
    loadRefs();
  }, []);

  async function fetchStatement() {
    if (mode === "apartment") {
      if (!apartmentId) return alert("Select an apartment");
      const data = await getApartmentStatement(apartmentId);
      setResult(data);
      return;
    }

    if (!tenantId) return alert("Select a tenant");
    const data = await getTenantStatement(tenantId);
    setResult(data);
  }

  const summary = result ? computeSummary(result) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Statements</h1>

      <section className="rounded border bg-white p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
          <div className="space-y-1">
            <label className="text-sm">Mode</label>
            <select
              className="w-full border p-2"
              value={mode}
              onChange={(e) => {
                setMode(e.target.value as any);
                setResult(null);
              }}
            >
              <option value="apartment">Apartment</option>
              <option value="tenant">Tenant</option>
            </select>
          </div>

          {mode === "apartment" ? (
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm">Apartment</label>
              <select className="w-full border p-2" value={apartmentId} onChange={(e) => setApartmentId(e.target.value)}>
                <option value="">Select apartment</option>
                {apartments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm">Tenant</label>
              <select className="w-full border p-2" value={tenantId} onChange={(e) => setTenantId(e.target.value)}>
                <option value="">Select tenant</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button className="rounded bg-black px-4 py-2 text-white" onClick={fetchStatement}>
          Get Statement
        </button>
      </section>

      {result && summary && (
        <section className="rounded border bg-white p-4 space-y-3">
          <h2 className="font-semibold">Summary</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded border p-3">
              <div className="font-semibold">Rent</div>
              <div>Expected: ₦{summary.rentExpected}</div>
              <div>Paid (applied): ₦{summary.rentApplied}</div>
              <div className="font-semibold">Balance: ₦{summary.rentBalance}</div>
            </div>

            <div className="rounded border p-3">
              <div className="font-semibold">Bills/Charges</div>
              <div>Expected: ₦{summary.billExpected}</div>
              <div>Paid (applied): ₦{summary.billApplied}</div>
              <div className="font-semibold">Balance: ₦{summary.billBalance}</div>
            </div>

            <div className="rounded border p-3 sm:col-span-2">
              <div className="font-semibold">Payments Recorded</div>
              <div>Total payments amount: ₦{summary.paymentsTotal}</div>
              <div className="text-xs text-gray-600">
                (Payments may include pending/rejected; balances reflect allocations.)
              </div>
            </div>
          </div>

          <details className="text-sm">
            <summary className="cursor-pointer font-semibold">Raw JSON</summary>
            <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </section>
      )}
    </div>
  );
}
