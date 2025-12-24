"use client";

import { useState } from "react";
import { tenantLogin } from "@/app/actions/auth-tenant";

export default function TenantLoginPage() {
  const [tenantId, setTenantId] = useState("");
  const [phone, setPhone] = useState("");

  async function submit() {
    try {
      if (!tenantId || !phone) return alert("Tenant ID and phone required");
      await tenantLogin({ tenantId, phone });
      window.location.href = "/tenant";
    } catch (e: any) {
      alert(e?.message || "Login failed");
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Tenant Login</h1>

      <input className="w-full border p-2" placeholder="Tenant ID" value={tenantId} onChange={(e) => setTenantId(e.target.value)} />
      <input className="w-full border p-2" placeholder="Phone (must match your profile)" value={phone} onChange={(e) => setPhone(e.target.value)} />

      <button className="w-full rounded bg-black px-4 py-2 text-white" onClick={submit}>
        Login
      </button>
    </div>
  );
}
