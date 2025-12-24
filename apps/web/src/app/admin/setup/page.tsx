"use client";

import { useEffect, useState } from "react";
import { getReferenceData, RefOption } from "@/app/actions/reference";
import {
  createApartment,
  createApartmentType,
  createProperty,
  createTenant
} from "@/app/actions/admin-core";

export default function AdminSetupPage() {
  const [ref, setRef] = useState<{
    properties: RefOption[];
    apartmentTypes: RefOption[];
    apartments: RefOption[];
    tenants: RefOption[];
    activeOccupancies: RefOption[];
  } | null>(null);

  // Property
  const [propName, setPropName] = useState("");
  const [propAddress, setPropAddress] = useState("");

  // Apartment Type
  const [typeName, setTypeName] = useState("");
  const [yearlyRent, setYearlyRent] = useState("");
  const [monthlyCharge, setMonthlyCharge] = useState("");

  // Apartment
  const [apartmentPropertyId, setApartmentPropertyId] = useState("");
  const [apartmentTypeId, setApartmentTypeId] = useState("");
  const [unitLabel, setUnitLabel] = useState("");

  // Tenant
  const [tenantName, setTenantName] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");

  async function refresh() {
    const data = await getReferenceData();
    setRef(data);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function submitProperty() {
    if (!propName || !propAddress) return alert("Property name and address required");
    await createProperty({ name: propName, address: propAddress });
    setPropName("");
    setPropAddress("");
    await refresh();
    alert("Property created");
  }

  async function submitApartmentType() {
    if (!typeName || !yearlyRent || !monthlyCharge) return alert("All type fields required");
    await createApartmentType({
      name: typeName,
      yearlyRentAmount: Number(yearlyRent),
      monthlyChargeAmount: Number(monthlyCharge)
    });
    setTypeName("");
    setYearlyRent("");
    setMonthlyCharge("");
    await refresh();
    alert("Apartment type created");
  }

  async function submitApartment() {
    if (!apartmentPropertyId || !apartmentTypeId || !unitLabel) return alert("All apartment fields required");
    await createApartment({
      propertyId: apartmentPropertyId,
      apartmentTypeId: apartmentTypeId,
      unitLabel
    });
    setUnitLabel("");
    await refresh();
    alert("Apartment created");
  }

  async function submitTenant() {
    if (!tenantName || !tenantPhone) return alert("Tenant name and phone required");
    await createTenant({
      fullName: tenantName,
      phone: tenantPhone,
      email: tenantEmail || undefined
    });
    setTenantName("");
    setTenantPhone("");
    setTenantEmail("");
    await refresh();
    alert("Tenant created");
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Admin Setup</h1>

      <section className="rounded border bg-white p-4 space-y-3">
        <h2 className="font-semibold">Create Property</h2>
        <input className="w-full border p-2" placeholder="Property name" value={propName} onChange={e => setPropName(e.target.value)} />
        <input className="w-full border p-2" placeholder="Property address" value={propAddress} onChange={e => setPropAddress(e.target.value)} />
        <button className="rounded bg-black px-4 py-2 text-white" onClick={submitProperty}>Save Property</button>
      </section>

      <section className="rounded border bg-white p-4 space-y-3">
        <h2 className="font-semibold">Create Apartment Type</h2>
        <input className="w-full border p-2" placeholder="Type name (e.g., 2 Bedroom)" value={typeName} onChange={e => setTypeName(e.target.value)} />
        <input className="w-full border p-2" placeholder="Yearly rent amount" value={yearlyRent} onChange={e => setYearlyRent(e.target.value)} />
        <input className="w-full border p-2" placeholder="Monthly charge amount" value={monthlyCharge} onChange={e => setMonthlyCharge(e.target.value)} />
        <button className="rounded bg-black px-4 py-2 text-white" onClick={submitApartmentType}>Save Apartment Type</button>
      </section>

      <section className="rounded border bg-white p-4 space-y-3">
        <h2 className="font-semibold">Create Apartment</h2>

        <div className="space-y-1">
          <label className="text-sm">Property</label>
          <select className="w-full border p-2" value={apartmentPropertyId} onChange={e => setApartmentPropertyId(e.target.value)}>
            <option value="">Select property</option>
            {ref?.properties?.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm">Apartment Type</label>
          <select className="w-full border p-2" value={apartmentTypeId} onChange={e => setApartmentTypeId(e.target.value)}>
            <option value="">Select apartment type</option>
            {ref?.apartmentTypes?.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>

        <input className="w-full border p-2" placeholder="Unit label (e.g., A-01)" value={unitLabel} onChange={e => setUnitLabel(e.target.value)} />
        <button className="rounded bg-black px-4 py-2 text-white" onClick={submitApartment}>Save Apartment</button>
      </section>

      <section className="rounded border bg-white p-4 space-y-3">
        <h2 className="font-semibold">Create Tenant</h2>
        <input className="w-full border p-2" placeholder="Full name" value={tenantName} onChange={e => setTenantName(e.target.value)} />
        <input className="w-full border p-2" placeholder="Phone (E.164 recommended e.g. +234...)" value={tenantPhone} onChange={e => setTenantPhone(e.target.value)} />
        <input className="w-full border p-2" placeholder="Email (optional)" value={tenantEmail} onChange={e => setTenantEmail(e.target.value)} />
        <button className="rounded bg-black px-4 py-2 text-white" onClick={submitTenant}>Save Tenant</button>
      </section>
    </div>
  );
}
