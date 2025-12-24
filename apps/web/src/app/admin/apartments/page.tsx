"use client";

import { ApartmentService } from "@/lib/services/apartment.service";
import { generateId } from "@/lib/utils/id";
import { nowISO } from "@/lib/utils/time";
import { useState } from "react";

export default function ApartmentsPage() {
  const service = new ApartmentService();
  const [propertyId, setPropertyId] = useState("");
  const [apartmentTypeId, setApartmentTypeId] = useState("");
  const [unitLabel, setUnitLabel] = useState("");

  async function submit() {
    await service.create({
      apartment_id: generateId("apt"),
      property_id: propertyId,
      apartment_type_id: apartmentTypeId,
      unit_label: unitLabel,
      status: "vacant",
      created_at: nowISO()
    });

    setUnitLabel("");
    alert("Apartment created");
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Create Apartment</h1>

      <input className="w-full border p-2" placeholder="Property ID"
        value={propertyId} onChange={e => setPropertyId(e.target.value)} />

      <input className="w-full border p-2" placeholder="Apartment Type ID"
        value={apartmentTypeId} onChange={e => setApartmentTypeId(e.target.value)} />

      <input className="w-full border p-2" placeholder="Unit Label"
        value={unitLabel} onChange={e => setUnitLabel(e.target.value)} />

      <button onClick={submit} className="rounded bg-black px-4 py-2 text-white">
        Save
      </button>
    </div>
  );
}
