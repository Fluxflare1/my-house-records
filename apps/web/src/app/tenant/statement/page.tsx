"use client";

import { useEffect, useState } from "react";
import { getTenantStatement } from "@/app/actions/statements";
import TenantSplash from "@/components/tenant/tenant-splash";

function n(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

export default function TenantStatementPage() {
  const [loading, setLoading] = useState(true);
  const [stmt, setStmt] = useState<any>(null);

  async function load() {
    setLoading(true);
    try {
      const s = await getTenantStatement();
      setStmt(s);
    } catch (e: any) {
      alert(e?.message || "Failed to load statement");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading && !stmt) return <TenantSplash title="Loading your statement..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Statement</h1>
        <p className="text-sm text-gray-700">
          History is grouped by your occupancy periods (so charges remain traceable).
        </p>
      </div>

      {stmt && (
        <section className="rounded border bg-white p-4 space-y-3">
          <div className="text-sm">
            <div><b>Tenant:</b> {stmt.tenantName}</div>
            <div><b>Total Balance:</b> ₦{n(stmt.grandTotals.totalBalance)} (Rent ₦{n(stmt.grandTotals.rentBalance)} • Bills ₦{n(stmt.grandTotals.billBalance)})</div>
          </div>

          {(stmt.blocks || []).length === 0 ? (
            <div className="text-sm text-gray-700">No occupancy history found.</div>
          ) : (
            <div className="space-y-4">
              {stmt.blocks.map((b: any) => (
                <div key={b.occupancyId} className="rounded border p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold">{b.apartmentLabel}</div>
                      <div className="text-xs text-gray-700">
                        Period: {b.startDate} → {b.endDate || "Present"} • Status: {b.status}
                      </div>
                    </div>
                    <div className="text-sm font-semibold">₦{n(b.totals.totalBalance)}</div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div className="rounded border p-3">
                      <div className="text-sm font-semibold mb-2">Rent</div>
                      {(b.rent || []).length === 0 ? (
                        <div className="text-sm text-gray-600">No rent items.</div>
                      ) : (
                        <div className="space-y-2">
                          {b.rent.map((r: any) => (
                            <div key={r.id} className="text-sm flex items-start justify-between gap-2">
                              <div>
                                <div className="font-semibold">{r.label}</div>
                                <div className="text-xs text-gray-600">Due: {r.dueDate || "—"}</div>
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
                        <div className="text-sm text-gray-600">No bill items.</div>
                      ) : (
                        <div className="space-y-2">
                          {b.bills.map((x: any) => (
                            <div key={x.id} className="text-sm flex items-start justify-between gap-2">
                              <div>
                                <div className="font-semibold">{x.label}</div>
                                <div className="text-xs text-gray-600">Due: {x.dueDate || "—"}</div>
                              </div>
                              <div className="font-semibold">₦{Math.max(0, n(x.balance))}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <div className="flex gap-2">
        <button className="rounded border px-4 py-2 text-sm" onClick={load}>
          Refresh
        </button>
      </div>
    </div>
  );
}
