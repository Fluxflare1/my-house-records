"use client";

import { useEffect, useState } from "react";
import { getReferenceData } from "@/app/actions/reference";
import { bondTenantAction } from "@/app/actions/admin-create";

type RefOption = { id: string; label: string };

export default function OccupancyPage() {
  const [apartments, setApartments] = useState<RefOption[]>([]);
  const [tenants, setTenants] = useState<RefOption[]>([]);

  const [apartmentId, setApartmentId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [startDate, setStartDate] = useState("");

  useEffect(() => {
    (async () => {
      const ref = await getReferenceData();
      setApartments(ref.apartments);
      setTenants(ref.tenants);
    })();
  }, []);

  async function bond() {
    if (!apartmentId || !tenantId || !startDate) {
      alert("All fields are required");
      return;
    }
    await bondTenantAction({ apartmentId, tenantId, startDate });
    alert("Tenant bonded to apartment");
  }

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-xl font-semibold">Bond Tenant</h1>

      <div className="space-y-1">
        <label className="text-sm">Apartment</label>
        <select
          className="w-full border p-2"
          value={apartmentId}
          onChange={(e) => setApartmentId(e.target.value)}
        >
          <option value="">Select apartment</option>
          {apartments.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label} ({a.id})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm">Tenant</label>
        <select
          className="w-full border p-2"
          value={tenantId}
          onChange={(e) => setTenantId(e.target.value)}
        >
          <option value="">Select tenant</option>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label} ({t.id})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm">Start Date</label>
        <input
          type="date"
          className="w-full border p-2"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <button onClick={bond} className="rounded bg-black px-4 py-2 text-white">
        Bond
      </button>
    </div>
  );
}
