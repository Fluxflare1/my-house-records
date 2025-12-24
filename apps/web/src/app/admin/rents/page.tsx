"use client";

import { RentService } from "@/lib/services/rent.service";
import { generateId } from "@/lib/utils/id";
import { nowISO } from "@/lib/utils/time";
import { useState } from "react";

export default function RentPage() {
  const service = new RentService();
  const [apartmentId, setApartmentId] = useState("");
  const [occupancyId, setOccupancyId] = useState("");
  const [amount, setAmount] = useState("");

  async function generate() {
    await service.generate({
      rent_id: generateId("rent"),
      apartment_id: apartmentId,
      occupancy_id: occupancyId,
      rent_period_start: new Date().toISOString(),
      rent_period_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
      expected_amount: Number(amount),
      due_date: nowISO(),
      status: "unpaid",
      created_at: nowISO()
    });

    alert("Rent generated");
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Generate Rent</h1>

      <input className="w-full border p-2" placeholder="Apartment ID"
        value={apartmentId} onChange={e => setApartmentId(e.target.value)} />

      <input className="w-full border p-2" placeholder="Occupancy ID"
        value={occupancyId} onChange={e => setOccupancyId(e.target.value)} />

      <input className="w-full border p-2" placeholder="Amount"
        value={amount} onChange={e => setAmount(e.target.value)} />

      <button onClick={generate} className="rounded bg-black px-4 py-2 text-white">
        Generate
      </button>
    </div>
  );
}
