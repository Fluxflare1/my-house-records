"use client";

import { useEffect, useState } from "react";
import { getReferenceData, RefOption } from "@/app/actions/reference";
import { bondOccupancy, endOccupancy } from "@/app/actions/admin-core";

export default function AdminOccupancyPage() {
  const [apartments, setApartments] = useState<RefOption[]>([]);
  const [tenants, setTenants] = useState<RefOption[]>([]);
  const [activeOccs, setActiveOccs] = useState<RefOption[]>([]);

  const [apartmentId, setApartmentId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [startDate, setStartDate] = useState("");

  const [endOccId, setEndOccId] = useState("");
  const [endDate, setEndDate] = useState("");

  async function refresh() {
    const ref = await getReferenceData();
    setApartments(ref.apartments);
    setTenants(ref.tenants);
    setActiveOccs(ref.activeOccupancies);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function bond() {
    if (!apartmentId || !tenantId || !startDate) return alert("All fields required");
    try {
      await bondOccupancy({ apartmentId, tenantId, startDate });
      setApartmentId("");
      setTenantId("");
      setStartDate("");
      await refresh();
      alert("Occupancy bonded");
    } catch (e: any) {
      alert(e?.message || "Bond failed");
    }
  }

  async function end() {
    if (!endOccId || !endDate) return alert("Occupancy and end date required");
    await endOccupancy({ occupancyId: endOccId, endDate });
    setEndOccId("");
    setEndDate("");
    await refresh();
    alert("Occupancy ended");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Occupancy</h1>

      <section className="rounded border bg-white p-4 space-y-3">
        <h2 className="font-semibold">Bond Tenant to Apartment</h2>

        <select className="w-full border p-2" value={apartmentId} onChange={e => setApartmentId(e.target.value)}>
          <option value="">Select apartment</option>
          {apartments.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
        </select>

        <select className="w-full border p-2" value={tenantId} onChange={e => setTenantId(e.target.value)}>
          <option value="">Select tenant</option>
          {tenants.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>

        <input type="date" className="w-full border p-2" value={startDate} onChange={e => setStartDate(e.target.value)} />

        <button className="rounded bg-black px-4 py-2 text-white" onClick={bond}>Bond</button>
      </section>

      <section className="rounded border bg-white p-4 space-y-3">
        <h2 className="font-semibold">End Active Occupancy</h2>

        <select className="w-full border p-2" value={endOccId} onChange={e => setEndOccId(e.target.value)}>
          <option value="">Select active occupancy</option>
          {activeOccs.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>

        <input type="date" className="w-full border p-2" value={endDate} onChange={e => setEndDate(e.target.value)} />

        <button className="rounded bg-black px-4 py-2 text-white" onClick={end}>End Occupancy</button>
      </section>
    </div>
  );
}
