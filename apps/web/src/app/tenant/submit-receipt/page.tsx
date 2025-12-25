"use client";

import { useEffect, useState } from "react";
import { tenantUploadReceipt } from "@/app/actions/tenant-receipts";
import { getTenantRecentPayments, TenantPaymentOption } from "@/app/actions/tenant-ux";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => {
      const result = String(reader.result || "");
      const idx = result.indexOf("base64,");
      if (idx === -1) return reject(new Error("Invalid base64 data"));
      resolve(result.slice(idx + "base64,".length));
    };
    reader.readAsDataURL(file);
  });
}

export default function TenantSubmitReceiptPage() {
  const [payments, setPayments] = useState<TenantPaymentOption[]>([]);
  const [paymentId, setPaymentId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const list = await getTenantRecentPayments(20);
      setPayments(list);
      // auto-select first without receipt if exists
      const firstNoReceipt = list.find((p) => !p.receiptUrl);
      setPaymentId(firstNoReceipt?.id || list[0]?.id || "");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function submit() {
    try {
      if (!paymentId) return alert("Select a payment");
      if (!file) return alert("Select a receipt file");

      const base64 = await fileToBase64(file);

      await tenantUploadReceipt({
        paymentId,
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        base64
      });

      alert("Receipt uploaded and attached");
      setFile(null);
      await refresh();
    } catch (e: any) {
      alert(e?.message || "Upload failed");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Submit Receipt</h1>

      <section className="rounded border bg-white p-4 space-y-3">
        {loading && <div className="text-sm text-gray-600">Loading payments...</div>}

        <div className="space-y-1">
          <label className="text-sm">Select Payment</label>
          <select className="w-full border p-2" value={paymentId} onChange={(e) => setPaymentId(e.target.value)}>
            <option value="">Select payment</option>
            {payments.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm">Receipt File</label>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>

        <button className="rounded bg-black px-4 py-2 text-white" onClick={submit}>
          Upload Receipt
        </button>

        <button className="rounded border px-4 py-2 text-sm" onClick={refresh}>
          Refresh List
        </button>
      </section>
    </div>
  );
}
