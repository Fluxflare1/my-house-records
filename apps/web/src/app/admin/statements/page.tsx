"use client";

import { useEffect, useMemo, useState } from "react";
import { getApartmentStatement, getTenantStatement } from "@/app/actions/statements";
import { getReferenceData, RefOption } from "@/app/actions/reference";
import { computeSummary } from "@/lib/utils/statement-summary";
import { SearchableSelect } from "@/components/common/SearchableSelect";

type ApartmentRef = { id: string; label: string; propertyId: string };

type RefData = {
  properties: RefOption[];
  apartments: ApartmentRef[];
  tenants: RefOption[];
};

export default function AdminStatementsPage() {
  const [ref, setRef] = useState<RefData>({ properties: [], apartments: [], tenants: [] });

  const [mode, setMode] = useState<"apartment" | "tenant">("apartment");
  const [propertyId, setPropertyId] = useState("");
  const [apartmentId, setApartmentId] = useState("");
  const [tenantId, setTenantId] = useState("");

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadRefs() {
    setLoading(true);
    try {
      const r: any = await getReferenceData();
      setRef({ properties: r.properties, apartments: r.apartments, tenants: r.tenants });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRefs();
  }, []);

  const propertyOptions = useMemo(
    () => [{ value: "", label: "All properties" }].concat(ref.properties.map((p) => ({ value: p.id, label: p.label }))),
    [ref.properties]
  );

  const filteredApartments = useMemo(() => {
    if (!propertyId) return ref.apartments;
    return ref.apartments.filter((a) => a.propertyId === propertyId);
  }, [ref.apartments, propertyId]);

  const apartmentOptions = useMemo(
    () => filteredApartments.map((a) => ({ value: a.id, label: a.label })),
    [filteredApartments]
  );

  const tenantOptions = useMemo(
    () => ref.tenants.map((t) => ({ value: t.id, label: t.label })),
    [ref.tenants]
  );

  // If property filter changes, clear apartment selection (prevents invalid selection)
  useEffect(() => {
    setApartmentId("");
  }, [propertyId]);

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
              disabled={loading}
            >
              <option value="apartment">Apartment</option>
              <option value="tenant">Tenant</option>
            </select>
          </div>

          <SearchableSelect
            label="Property Filter"
            value={propertyId}
            onChange={setPropertyId}
            options={propertyOptions}
            placeholder="All properties"
            disabled={loading}
            searchPlaceholder="Search properties..."
          />

          {mode === "apartment" ? (
            <SearchableSelect
              label="Apartment"
              value={apartmentId}
              onChange={setApartmentId}
              options={apartmentOptions}
              placeholder={propertyId ? "Select apartment (filtered)" : "Select apartment"}
              disabled={loading}
              searchPlaceholder="Search apartments..."
            />
          ) : (
            <SearchableSelect
              label="Tenant"
              value={tenantId}
              onChange={setTenantId}
              options={tenantOptions}
              placeholder="Select tenant"
              disabled={loading}
              searchPlaceholder="Search tenants..."
            />
          )}
        </div>

        <button className="rounded bg-black px-4 py-2 text-white" onClick={fetchStatement}>
          Get Statement
        </button>

        <button className="rounded border px-4 py-2 text-sm" onClick={loadRefs}>
          Refresh Lists
        </button>

        {mode === "apartment" && (
          <div className="text-xs text-gray-600">
            Apartments shown: {filteredApartments.length} / {ref.apartments.length}
          </div>
        )}
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
