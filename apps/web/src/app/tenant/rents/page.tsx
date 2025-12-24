"use client";

import { useState } from "react";

export default function TenantRentsPage() {
  const [rentId, setRentId] = useState("");
  const [status, setStatus] = useState("");

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-xl font-semibold">My Rent</h1>

      <input className="w-full border p-2" placeholder="Rent ID"
        value={rentId} onChange={e => setRentId(e.target.value)} />

      <input className="w-full border p-2" placeholder="Status"
        value={status} onChange={e => setStatus(e.target.value)} />
    </div>
  );
}
