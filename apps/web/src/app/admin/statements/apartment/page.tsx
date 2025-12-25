"use client";

import { useEffect, useMemo, useState } from "react";
import { handleAdminClientError } from "@/lib/ui/admin-error";
import { getReferenceData } from "@/app/actions/reference";
import { getAdminApartmentStatement } from "@/app/actions/statements";

function n(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

export default function AdminApartmentStatementPage() {
  const [ref, setRef] = useState<any>(null);
  const [apartmentId, setApartmentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [stmt, setStmt] = useState<any>(null);

  async function loadRef() {
    setLoading(true);
    try {
      const r = await getReferenceData();
      setRef(r);
    } catch (e: any) {
      if (handleAdminClientError(e)) return;
      alert(e?.message || "Failed to load reference data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRef();
  }, []);

  async function run() {
    if (!apartmentId) return alert("Select an apartment");
    setLoading(true);
    try {
      const s = await getAdminApartmentStatement({ apartmentId });
      setStmt(s);
    } catch (e: any) {
      if (handleAdminClientError(e)) return;
      alert(e?.message || "Failed to load statement");
    } finally {
      setLoading(false);
    }
  }

  const apartments = useMemo(() => ref?.apartments || [], [ref]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Apartment Statement</h1>
        <p className="text-sm text-gray-700">
          Shows <b>occupancy history</b> and debt per occupancy period (traceable to who lived when).
        </p>
      </div>

      <section className="rounded border bg-white p-4 space-y-3">
        <div className="text-sm font-semibold">Select apartment</div>
        <div className="flex flex-col md:flex-row gap-2">
          <select className="border p-2 w-full" value={apartmentId} onChange={(e) => setApartmentId(e.target.value)} disabled={loading}>
            <option value="">Select apartment…</option>
            {apartments.map((a: any) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
          <button className="rounded bg-black px-4 py-2 text-white text-sm" onClick={run} disabled={loading}>
            {loading ? "Loading..." : "View Statement"}
          </button>
        </div>
      </section>

      {stmt && (
        <section className="rounded border bg-white p-4 space-y-4">
          <div className="text-sm">
            <div><b>Apartment:</b> {stmt.apartmentLabel} ({stmt.apartmentId})</div>
            <div><b>Grand Balance:</b> Rent ₦{n(stmt.grandTotals.rentBalance)} • Bills ₦{n(stmt.grandTotals.billBalance)} • Total ₦{n(stmt.grandTotals.totalBalance)}</div>
          </div>

          {(stmt.blocks || []).length === 0 ? (
            <div className="text-sm text-gray-700">No occupancy history for this apartment.</div>
          ) : (
            <div className="space-y-4">
              {stmt.blocks.map((b: any) => (
                <div key={b.occupancyId} className="rounded border p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold">Occupancy {b.occupancyId}</div>
                      <div className="text-xs text-gray-700">
                        Tenant: <b>{b.tenantName}</b> • Start: {b.startDate} • End: {b.endDate || "—"} • Status: {b.status}
                      </div>
                    </div>
                    <div className="text-sm font-semibold">
                      Total ₦{n(b.totals.totalBalance)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div className="rounded border p-3">
                      <div className="text-sm font-semibold mb-2">Rent</div>
                      {(b.rent || []).length === 0 ? (
                        <div className="text-sm text-gray-600">No rent records.</div>
                      ) : (
                        <div className="space-y-2">
                          {b.rent.map((r: any) => (
                            <div key={r.id} className="text-sm flex items-start justify-between gap-2">
                              <div>
                                <div className="font-semibold">{r.label}</div>
                                <div className="text-xs text-gray-600">Due: {r.dueDate || "—"} • ID: {r.id}</div>
                                <div className="text-xs text-gray-600">Expected ₦{n(r.expected)} • Paid ₦{n(r.applied)}</div>
                              </div>
                              <div className="font-semibold">₦{Math.max(0, n(r.balance))}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="rounded border p-3">
                      <div className="text-sm font-semibold mb-2">Bills / Charges</div>
                      {(b.bills || []).length === 0 ? (
                        <div className="text-sm text-gray-600">No bills/charges records.</div>
                      ) : (
                        <div className="space-y-2">
                          {b.bills.map((x: any) => (
                            <div key={x.id} className="text-sm flex items-start justify-between gap-2">
                              <div>
                                <div className="font-semibold">{x.label}</div>
                                <div className="text-xs text-gray-600">Due: {x.dueDate || "—"} • ID: {x.id}</div>
                                <div className="text-xs text-gray-600">Expected ₦{n(x.expected)} • Paid ₦{n(x.applied)}</div>
                              </div>
                              <div className="font-semibold">₦{Math.max(0, n(x.balance))}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-700">
                    Totals: Rent ₦{n(b.totals.rentBalance)} • Bills ₦{n(b.totals.billBalance)} • Total ₦{n(b.totals.totalBalance)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <details className="text-sm">
            <summary className="cursor-pointer font-semibold">Debug JSON</summary>
            <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs">{JSON.stringify(stmt, null, 2)}</pre>
          </details>
        </section>
      )}
    </div>
  );
}
