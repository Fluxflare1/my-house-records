"use client";

import { OccupancyService } from "@/lib/services/occupancy.service";
import { generateId } from "@/lib/utils/id";
import { nowISO } from "@/lib/utils/time";
import { useState } from "react";

export default function OccupancyPage() {
  const service = new OccupancyService();
  const [apartmentId, setApartmentId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [startDate, setStartDate] = useState("");

  async function bond() {
    await service.bond({
      occupancy_id: generateId("occ"),
      apartment_id: apartmentId,
      tenant_id: tenantId,
      start_date: startDate,
      status: "active",
      created_at: nowISO()
    });

    alert("Tenant bonded to apartment");
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Bond Tenant</h1>

      <input className="w-full border p-2" placeholder="Apartment ID"
        value={apartmentId} onChange={e => setApartmentId(e.target.value)} />

      <input className="w-full border p-2" placeholder="Tenant ID"
        value={tenantId} onChange={e => setTenantId(e.target.value)} />

      <input type="date" className="w-full border p-2"
        value={startDate} onChange={e => setStartDate(e.target.value)} />

      <button onClick={bond} className="rounded bg-black px-4 py-2 text-white">
        Bond
      </button>
    </div>
  );
}
