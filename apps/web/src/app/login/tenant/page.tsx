"use client";

import { useState } from "react";
import { tenantLogin } from "@/app/actions/auth-tenant";

export default function TenantLoginPage() {
  const [tenantId, setTenantId] = useState("");
  const [phone, setPhone] = useState("");

  const [busy, setBusy] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      if (!tenantId || !phone) {
        alert("Tenant ID and phone required");
        return;
      }
      await tenantLogin({ tenantId, phone });
      window.location.href = "/tenant";
    } catch (e: any) {
      alert(e?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function demoLogin() {
    setDemoBusy(true);
    try {
      const r = await fetch("/api/dev/demo/tenant-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "tenant@demo.local",
          password: "Tenant12345!"
        })
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        throw new Error(data?.error || "Demo login failed");
      }

      window.location.href = "/tenant";
    } catch (e: any) {
      alert(e?.message || "Demo login failed");
    } finally {
      setDemoBusy(false);
    }
  }

  const isDev = process.env.NODE_ENV !== "production";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded border bg-white p-6 space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Tenant Login</h1>
          <p className="text-sm text-gray-700">
            Use your Tenant ID and phone number as provided by admin.
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-sm">Tenant ID</label>
          <input
            className="w-full border p-2"
            placeholder="Tenant ID"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm">Phone (must match your profile)</label>
          <input
            className="w-full border p-2"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </div>

        <button
          className="w-full rounded bg-black px-4 py-2 text-white text-sm disabled:opacity-60"
          onClick={submit}
          disabled={busy || demoBusy}
        >
          {busy ? "Logging in..." : "Login"}
        </button>

        {isDev ? (
          <button
            className="w-full rounded border px-4 py-2 text-sm disabled:opacity-60 hover:bg-gray-50"
            onClick={demoLogin}
            disabled={busy || demoBusy}
            title="Development only"
          >
            {demoBusy ? "Logging in (demo)..." : "Demo Login (Dev Only)"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
