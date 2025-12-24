"use client";

import { useState } from "react";

export default function TenantOccupancyPage() {
  // In Phase 6, this will be fetched by tenantId
  const [occupancyId, setOccupancyId] = useState("");
  const [apartmentId, setApartmentId] = useState("");
  const [startDate, setStartDate] = useState("");

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-xl font-semibold">My Occupancy</h1>

      <input className="w-full border p-2" placeholder="Occupancy ID"
        value={occupancyId} onChange={e => setOccupancyId(e.target.value)} />

      <input className="w-full border p-2" placeholder="Apartment ID"
        value={apartmentId} onChange={e => setApartmentId(e.target.value)} />

      <input className="w-full border p-2" placeholder="Start Date"
        value={startDate} onChange={e => setStartDate(e.target.value)} />
    </div>
  );
}
