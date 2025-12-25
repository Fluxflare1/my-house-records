"use client";

import { useEffect, useMemo, useState } from "react";
import { handleAdminClientError } from "@/lib/ui/admin-error";
import { getReferenceData } from "@/app/actions/reference";
import { createOccupancy, vacateOccupancy, listOccupancies } from "@/app/actions/occupancy";

function todayYMD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

type Ref = Awaited<ReturnType<typeof getReferenceData>>;
type OccRow = Awaited<ReturnType<typeof listOccupancies>>[number];

export default function AdminOccupancyPage() {
  const [ref, setRef] = useState<Ref | null>(null);
  const [rows, setRows] = useState<OccRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [apartmentId, setApartmentId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [startDate, setStartDate] = useState(todayYMD());

  const [vacateId, setVacateId] = useState("");
  const [endDate, setEndDate] = useState(todayYMD());

  async function refresh() {
    setLoading(true);
    try {
      const [r, o] = await Promise.all([getReferenceData(), listOccupancies()]);
      setRef(r);
      setRows(o);
    } catch (e: any) {
      if (handleAdminClientError(e)) return;
      alert(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const activeRows = useMemo(() => rows.filter((r) => String(r.status).toLowerCase() === "active" && !r.endDate), [rows]);
  const endedRows = useMemo(() => rows.filter((r) => String(r.status).toLowerCase() !== "active" || !!r.endDate), [rows]);

  const occupiedApartmentIds = useMemo(() => new Set(activeRows.map((r) => r.apartmentId)), [activeRows]);
  const occupiedTenantIds = useMemo(() => new Set(activeRows.map((r) => r.tenantId)), [activeRows]);

  const apartments = useMemo(() => {
    const list = ref?.apartments || [];
    // Hide already occupied apartments for bonding dropdown
    return list.filter((a: any) => !occupiedApartmentIds.has(a.id));
  }, [ref, occupiedApartmentIds]);

  const tenants = useMemo(() => {
    const list = ref?.tenants || [];
    // Hide tenants already occupying (strict mode)
    return list.filter((t: any) => !occupiedTenantIds.has(t.id));
  }, [ref, occupiedTenantIds]);

  async function bond() {
    try {
      await createOccupancy({ apartmentId, tenantId, startDate });
      alert("Occupancy created (tenant bonded).");
      setApartmentId("");
      setTenantId("");
      setStartDate(todayYMD());
      await refresh();
    } catch (e: any) {
      if (handleAdminClientError(e)) return;
      alert(e?.message || "Failed to create occupancy");
    }
  }

  async function vacate() {
    try {
      if (!vacateId) return alert("Select an active occupancy to vacate.");
      await vacateOccupancy({ occupancyId: vacateId, endDate });
      alert("Occupancy ended (tenant vacated).");
      setVacateId("");
      setEndDate(todayYMD());
      await refresh();
    } catch (e: any) {
      if (handleAdminClientError(e)) return;
      alert(e?.message || "Failed to vacate occupancy");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Occupancy</h1>
        <p className="text-sm text-gray-700">
          Bond tenant ↔ apartment using occupancies. Vacating closes the occupancy and preserves history for debt tracking.
        </p>
      </div>

      <section className="rounded border bg-white p-4 space-y-3">
        <div className="text-sm font-semibold">Bond Tenant to Apartment</div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="space-y-1">
            <label className="text-sm">Apartment (available only)</label>
            <select className="w-full border p-2" value={apartmentId} onChange={(e) => setApartmentId(e.target.value)} disabled={loading}>
              <option value="">Select apartment…</option>
              {apartments.map((a: any) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
            <div className="text-xs text-gray-600">Occupied apartments are hidden to prevent double occupancy.</div>
          </div>

          <div className="space-y-1">
            <label className="text-sm">Tenant (not currently active)</label>
            <select className="w-full border p-2" value={tenantId} onChange={(e) => setTenantId(e.target.value)} disabled={loading}>
              <option value="">Select tenant…</option>
              {tenants.map((t: any) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
            <div className="text-xs text-gray-600">Tenants with active occupancy are hidden (strict).</div>
          </div>

          <div className="space-y-1">
            <label className="text-sm">Start date</label>
            <input className="w-full border p-2" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
        </div>

        <button className="rounded bg-black px-4 py-2 text-white text-sm" onClick={bond} disabled={loading}>
          Bond Tenant
        </button>
      </section>

      <section className="rounded border bg-white p-4 space-y-3">
        <div className="text-sm font-semibold">Vacate Tenant (End Occupancy)</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-sm">Active occupancy</label>
            <select className="w-full border p-2" value={vacateId} onChange={(e) => setVacateId(e.target.value)} disabled={loading}>
              <option value="">Select active occupancy…</option>
              {activeRows.map((o) => (
                <option key={o.occupancyId} value={o.occupancyId}>
                  {o.occupancyId} | Apt {o.apartmentLabel} | {o.tenantName} | Start {o.startDate}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-600">Vacating preserves history: debts remain tied to occupancy.</div>
          </div>

          <div className="space-y-1">
            <label className="text-sm">End date</label>
            <input className="w-full border p-2" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        <button className="rounded border px-4 py-2 text-sm" onClick={vacate} disabled={loading}>
          Vacate (End Occupancy)
        </button>
      </section>

      <section className="rounded border bg-white p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold">Occupancy History</div>
          <button className="rounded border px-3 py-2 text-sm" onClick={refresh}>Refresh</button>
        </div>

        <div className="text-sm font-semibold">Active</div>
        {activeRows.length === 0 ? (
          <div className="text-sm text-gray-600">No active occupancies.</div>
        ) : (
          <div className="space-y-2">
            {activeRows.map((o) => (
              <div key={o.occupancyId} className="rounded border p-3 text-sm">
                <div className="font-semibold">{o.occupancyId}</div>
                <div>Apt: {o.apartmentLabel} ({o.apartmentId})</div>
                <div>Tenant: {o.tenantName} ({o.tenantId})</div>
                <div>Start: {o.startDate}</div>
              </div>
            ))}
          </div>
        )}

        <div className="text-sm font-semibold pt-2">Ended</div>
        {endedRows.length === 0 ? (
          <div className="text-sm text-gray-600">No ended occupancies.</div>
        ) : (
          <div className="space-y-2">
            {endedRows.slice(0, 20).map((o) => (
              <div key={o.occupancyId} className="rounded border p-3 text-sm">
                <div className="font-semibold">{o.occupancyId}</div>
                <div>Apt: {o.apartmentLabel} ({o.apartmentId})</div>
                <div>Tenant: {o.tenantName} ({o.tenantId})</div>
                <div>Start: {o.startDate} • End: {o.endDate || "—"}</div>
                <div className="text-xs text-gray-600">Status: {o.status}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
