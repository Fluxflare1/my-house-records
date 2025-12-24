"use client";

import { useEffect, useState } from "react";
import { getReferenceData } from "@/app/actions/reference";
import { createApartmentAction } from "@/app/actions/admin-create";

type RefOption = { id: string; label: string };

export default function ApartmentsPage() {
  const [properties, setProperties] = useState<RefOption[]>([]);
  const [types, setTypes] = useState<RefOption[]>([]);

  const [propertyId, setPropertyId] = useState("");
  const [apartmentTypeId, setApartmentTypeId] = useState("");
  const [unitLabel, setUnitLabel] = useState("");

  useEffect(() => {
    (async () => {
      const ref = await getReferenceData();
      setProperties(ref.properties);
      setTypes(ref.apartmentTypes);
    })();
  }, []);

  async function submit() {
    if (!propertyId || !apartmentTypeId || !unitLabel) {
      alert("All fields are required");
      return;
    }
    await createApartmentAction({ propertyId, apartmentTypeId, unitLabel });
    setUnitLabel("");
    alert("Apartment created");
  }

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-xl font-semibold">Create Apartment</h1>

      <div className="space-y-1">
        <label className="text-sm">Property</label>
        <select
          className="w-full border p-2"
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
        >
          <option value="">Select property</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label} ({p.id})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm">Apartment Type</label>
        <select
          className="w-full border p-2"
          value={apartmentTypeId}
          onChange={(e) => setApartmentTypeId(e.target.value)}
        >
          <option value="">Select type</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm">Unit Label</label>
        <input
          className="w-full border p-2"
          placeholder="e.g., A-01"
          value={unitLabel}
          onChange={(e) => setUnitLabel(e.target.value)}
        />
      </div>

      <button onClick={submit} className="rounded bg-black px-4 py-2 text-white">
        Save
      </button>
    </div>
  );
}
