"use client";

import { PropertyService } from "@/lib/services/property.service";
import { generateId } from "@/lib/utils/id";
import { nowISO } from "@/lib/utils/time";
import { useState } from "react";

export default function PropertiesPage() {
  const service = new PropertyService();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  async function submit() {
    await service.create({
      property_id: generateId("property"),
      name,
      address,
      status: "active",
      created_at: nowISO()
    });

    setName("");
    setAddress("");
    alert("Property created");
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Create Property</h1>

      <input className="w-full border p-2" placeholder="Name"
        value={name} onChange={e => setName(e.target.value)} />

      <input className="w-full border p-2" placeholder="Address"
        value={address} onChange={e => setAddress(e.target.value)} />

      <button onClick={submit} className="rounded bg-black px-4 py-2 text-white">
        Save
      </button>
    </div>
  );
}
