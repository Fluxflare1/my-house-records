"use client";

import { useState } from "react";
import { tenantUploadReceipt } from "@/app/actions/tenant-receipts";

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
  const [paymentId, setPaymentId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  async function submit() {
    try {
      if (!paymentId) return alert("Payment ID required");
      if (!file) return alert("Select a receipt file");

      const base64 = await fileToBase64(file);

      await tenantUploadReceipt({
        paymentId,
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        base64
      });

      alert("Receipt uploaded and attached to your payment");
      setPaymentId("");
      setFile(null);
    } catch (e: any) {
      alert(e?.message || "Upload failed");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Submit Receipt</h1>

      <section className="rounded border bg-white p-4 space-y-3">
        <input
          className="w-full border p-2"
          placeholder="Payment ID"
          value={paymentId}
          onChange={(e) => setPaymentId(e.target.value)}
        />

        <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />

        <button className="rounded bg-black px-4 py-2 text-white" onClick={submit}>
          Upload Receipt
        </button>
      </section>
    </div>
  );
}
