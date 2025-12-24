"use client";

import { useState } from "react";
import { PaymentService } from "@/lib/services/payment.service";
import { getAdapters } from "@/lib/adapters";
import { generateId } from "@/lib/utils/id";
import { nowISO } from "@/lib/utils/time";

export default function TenantPaymentsPage() {
  const paymentService = new PaymentService();
  const { drive } = getAdapters();

  const [apartmentId, setApartmentId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState<File | null>(null);

  async function submit() {
    if (!file) {
      alert("Receipt required");
      return;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const driveFileId = await drive.uploadFile(
      "receipts",
      file.name,
      file.type,
      buffer
    );

    await paymentService.record({
      payment_id: generateId("pay"),
      apartment_id: apartmentId,
      tenant_id: tenantId,
      payment_date: nowISO(),
      amount: Number(amount),
      receipt_drive_file_url: driveFileId,
      verification_status: "pending",
      created_at: nowISO()
    });

    alert("Payment submitted. Awaiting verification.");
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Submit Payment</h1>

      <input className="w-full border p-2" placeholder="Apartment ID"
        value={apartmentId} onChange={e => setApartmentId(e.target.value)} />

      <input className="w-full border p-2" placeholder="Tenant ID"
        value={tenantId} onChange={e => setTenantId(e.target.value)} />

      <input className="w-full border p-2" placeholder="Amount"
        value={amount} onChange={e => setAmount(e.target.value)} />

      <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />

      <button onClick={submit} className="rounded bg-black px-4 py-2 text-white">
        Submit
      </button>
    </div>
  );
}
