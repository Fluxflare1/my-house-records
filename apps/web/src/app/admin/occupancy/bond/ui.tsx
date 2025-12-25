"use client";

import { useEffect, useState } from "react";

type Tenant = { tenant_id: string; name: string; email: string; phone: string };
type Apt = { apartment_id: string; label: string; apartment_type: string; property_id: string; status: string };

export default function BondClient() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [apartments, setApartments] = useState<Apt[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  async function load() {
    setErr("");
    setOk("");
    setLoading(true);
    try {
      const r = await fetch("/api/admin/occupancies/bond/options", { cache: "no-store" });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErr(data?.error || "Failed to load options");
        setTenants([]);
        setApartments([]);
      } else {
        setTenants(Array.isArray(data?.tenants) ? data.tenants : []);
        setApartments(Array.isArray(data?.apartments) ? data.apartments : []);
      }
    } catch (e: any) {
      setErr(e?.message || "Failed to load options");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setOk("");

    const fd = new FormData(e.currentTarget);
    const tenantId = String(fd.get("tenantId") || "");
    const apartmentId = String(fd.get("apartmentId") || "");
    const startDate = String(fd.get("startDate") || "");

    if (!tenantId || !apartmentId || !startDate) {
      setErr("Please select tenant, apartment and start date.");
      return;
    }

    const r = await fetch("/api/admin/occupancies/bond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, apartmentId, startDate })
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      setErr(data?.error || "Bonding failed.");
      return;
    }

    setOk(`Bonded successfully. Occupancy ID: ${data.occupancyId}`);
    await load();
    e.currentTarget.reset();
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Bond Tenant to Apartment</h1>
          <p className="mt-1 text-sm text-gray-600">
            This starts an occupancy. After bonding, rent/bills generation applies to this active occupancy.
          </p>
        </div>
        <button onClick={load} className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
          Refresh
        </button>
      </div>

      {err ? <div className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div> : null}
      {ok ? <div className="mt-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{ok}</div> : null}

      <div className="mt-6 rounded-lg border bg-white p-5">
        {loading ? (
          <div className="text-sm">Loading…</div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tenant</label>
              <select name="tenantId" className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
                <option value="">Select…</option>
                {tenants.map((t) => (
                  <option key={t.tenant_id} value={t.tenant_id}>
                    {t.name || t.tenant_id} {t.phone ? `• ${t.phone}` : ""} {t.email ? `• ${t.email}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Apartment (available only)</label>
              <select name="apartmentId" className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
                <option value="">Select…</option>
                {apartments.map((a) => (
                  <option key={a.apartment_id} value={a.apartment_id}>
                    {a.label} {a.apartment_type ? `• ${a.apartment_type}` : ""} {a.property_id ? `• ${a.property_id}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Start date</label>
              <input name="startDate" type="date" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
            </div>

            <button className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90">
              Bond (Create Occupancy)
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
