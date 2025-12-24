"use client";

import { useEffect, useState } from "react";
import { getReferenceData, RefOption } from "@/app/actions/reference";
import { createRent } from "@/app/actions/admin-rent";

export default function AdminRentPage() {
  const [apartments, setApartments] = useState<RefOption[]>([]);
  const [activeOccs, setActiveOccs] = useState<RefOption[]>([]);

  const [apartmentId, setApartmentId] = useState("");
  const [occupancyId, setOccupancyId] = useState("");

  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  async function refresh() {
    const ref = await getReferenceData();
    setApartments(ref.apartments);
    setActiveOccs(ref.activeOccupancies);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function submit() {
    if (!apartmentId || !occupancyId || !periodStart || !periodEnd || !amount || !dueDate) {
      return alert("All fields are required");
    }
    await createRent({
      apartmentId,
      occupancyId,
      rentPeriodStart: periodStart,
      rentPeriodEnd: periodEnd,
      expectedAmount: Number(amount),
      dueDate
    });
    setAmount("");
    alert("Rent created");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Rent (Yearly/Lease)</h1>

      <section className="rounded border bg-white p-4 space-y-3">
        <select className="w-full border p-2" value={apartmentId} onChange={e => setApartmentId(e.target.value)}>
          <option value="">Select apartment</option>
          {apartments.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
        </select>

        <select className="w-full border p-2" value={occupancyId} onChange={e => setOccupancyId(e.target.value)}>
          <option value="">Select active occupancy</option>
          {activeOccs.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>

        <div className="grid grid-cols-2 gap-2">
          <input type="date" className="w-full border p-2" value={periodStart} onChange={e => setPeriodStart(e.target.value)} />
          <input type="date" className="w-full border p-2" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} />
        </div>

        <input className="w-full border p-2" placeholder="Expected amount" value={amount} onChange={e => setAmount(e.target.value)} />
        <input type="date" className="w-full border p-2" value={dueDate} onChange={e => setDueDate(e.target.value)} />

        <button className="rounded bg-black px-4 py-2 text-white" onClick={submit}>Create Rent</button>
      </section>
    </div>
  );
}
