"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getTenantHomeData } from "@/app/actions/tenant-home";

function copy(text: string) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(
    () => alert("Copied"),
    () => alert("Copy failed")
  );
}

export default function TenantHomePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const res = await getTenantHomeData();
      setData(res);
    })().catch((e) => alert(e?.message || "Failed to load"));
  }, []);

  const contactHref = useMemo(() => {
    if (!data?.adminContact?.whatsappE164) return "";
    const num = String(data.adminContact.whatsappE164).replace(/\s+/g, "");
    return `https://wa.me/${num.replace(/^\+/, "")}`;
  }, [data]);

  if (!data) {
    return <div className="text-sm text-gray-700">Loading...</div>;
  }

  const apt = data.apartmentDetails;
  const bal = data.balances;
  const pay = data.paymentDetails;
  const admin = data.adminContact;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, {data.tenantFirstName}</h1>
        <p className="text-sm text-gray-700">
          This is your home overview. Use the buttons below to view your statement or upload receipts.
        </p>
      </div>

      <section className="rounded border bg-white p-4 space-y-2">
        <div className="text-sm font-semibold">Current Apartment</div>

        {apt ? (
          <div className="text-sm text-gray-800 space-y-1">
            <div><b>Unit:</b> {apt.unitLabel}</div>
            <div><b>Property:</b> {apt.propertyName}</div>
            <div><b>Type:</b> {apt.apartmentTypeName}</div>
            <div><b>Occupancy Start:</b> {apt.startDate}</div>
          </div>
        ) : (
          <div className="text-sm text-gray-700">
            You are not currently bonded to an apartment. Contact admin.
          </div>
        )}
      </section>

      <section className="rounded border bg-white p-4 space-y-2">
        <div className="text-sm font-semibold">Current Balance</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
          <div className="rounded border p-3">
            <div className="font-semibold">Rent</div>
            <div>₦{bal.rentBalance}</div>
          </div>
          <div className="rounded border p-3">
            <div className="font-semibold">Bills/Charges</div>
            <div>₦{bal.billBalance}</div>
          </div>
          <div className="rounded border p-3">
            <div className="font-semibold">Total</div>
            <div>₦{bal.totalBalance}</div>
          </div>
        </div>
      </section>

      <section className="rounded border bg-white p-4 space-y-3">
        <div className="text-sm font-semibold">Quick Actions</div>
        <div className="flex flex-wrap gap-2">
          <Link className="rounded bg-black px-4 py-2 text-white text-sm" href="/tenant/dashboard">
            View Statement
          </Link>
          <Link className="rounded border px-4 py-2 text-sm" href="/tenant/submit-receipt">
            Upload Receipt
          </Link>

          {contactHref ? (
            <a className="rounded border px-4 py-2 text-sm" href={contactHref} target="_blank" rel="noreferrer">
              Contact Admin (WhatsApp)
            </a>
          ) : (
            <button className="rounded border px-4 py-2 text-sm" onClick={() => alert("Admin WhatsApp not set yet")}>
              Contact Admin
            </button>
          )}
        </div>

        {(admin.phoneE164 || admin.email) && (
          <div className="text-xs text-gray-700">
            {admin.phoneE164 && <div><b>Admin Phone:</b> {admin.phoneE164}</div>}
            {admin.email && <div><b>Admin Email:</b> {admin.email}</div>}
          </div>
        )}
      </section>

      <section className="rounded border bg-white p-4 space-y-2">
        <div className="text-sm font-semibold">Payment Account Details</div>

        {(pay.accountNumber || pay.bankName || pay.accountName) ? (
          <div className="text-sm text-gray-800 space-y-2">
            {pay.bankName && (
              <div className="flex items-center justify-between gap-2">
                <div><b>Bank:</b> {pay.bankName}</div>
                <button className="text-xs underline" onClick={() => copy(pay.bankName)}>Copy</button>
              </div>
            )}
            {pay.accountName && (
              <div className="flex items-center justify-between gap-2">
                <div><b>Account Name:</b> {pay.accountName}</div>
                <button className="text-xs underline" onClick={() => copy(pay.accountName)}>Copy</button>
              </div>
            )}
            {pay.accountNumber && (
              <div className="flex items-center justify-between gap-2">
                <div><b>Account Number:</b> {pay.accountNumber}</div>
                <button className="text-xs underline" onClick={() => copy(pay.accountNumber)}>Copy</button>
              </div>
            )}
            {pay.note && <div className="text-xs text-gray-700">{pay.note}</div>}
          </div>
        ) : (
          <div className="text-sm text-gray-700">
            Payment account details are not set yet. Contact admin.
          </div>
        )}
      </section>
    </div>
  );
}
