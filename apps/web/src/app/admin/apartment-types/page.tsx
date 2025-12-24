"use client";

import { ApartmentTypeService } from "@/lib/services/apartment-type.service";
import { generateId } from "@/lib/utils/id";
import { nowISO } from "@/lib/utils/time";
import { useState } from "react";

export default function ApartmentTypesPage() {
  const service = new ApartmentTypeService();

  const [name, setName] = useState("");
  const [yearlyRent, setYearlyRent] = useState("");
  const [monthlyCharge, setMonthlyCharge] = useState("");

  async function submit() {
    await service.create({
      apartment_type_id: generateId("apt_type"),
      name,
      yearly_rent_amount: Number(yearlyRent),
      monthly_charge_amount: Number(monthlyCharge),
      active: true,
      created_at: nowISO()
    });

    setName("");
    setYearlyRent("");
    setMonthlyCharge("");
    alert("Apartment type created");
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Create Apartment Type</h1>

      <input className="w-full border p-2" placeholder="Name"
        value={name} onChange={e => setName(e.target.value)} />

      <input className="w-full border p-2" placeholder="Yearly Rent"
        value={yearlyRent} onChange={e => setYearlyRent(e.target.value)} />

      <input className="w-full border p-2" placeholder="Monthly Charges"
        value={monthlyCharge} onChange={e => setMonthlyCharge(e.target.value)} />

      <button onClick={submit} className="rounded bg-black px-4 py-2 text-white">
        Save
      </button>
    </div>
  );
}
