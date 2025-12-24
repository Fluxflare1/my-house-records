"use client";

import { useState } from "react";

export default function TenantBillsPage() {
  const [billId, setBillId] = useState("");
  const [status, setStatus] = useState("");

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-xl font-semibold">My Bills & Charges</h1>

      <input className="w-full border p-2" placeholder="Bill ID"
        value={billId} onChange={e => setBillId(e.target.value)} />

      <input className="w-full border p-2" placeholder="Status"
        value={status} onChange={e => setStatus(e.target.value)} />
    </div>
  );
}
