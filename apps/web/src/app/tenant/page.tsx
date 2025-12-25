apps/web/src/app/tenant/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getTenantHomeData } from "@/app/actions/tenant-home";
import { getTenantDashboard } from "@/app/actions/tenant";
import InstallPWAButton from "@/components/tenant/install-pwa";

function copy(text: string) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(
    () => alert("Copied"),
    () => alert("Copy failed")
  );
}

function n(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

function s(v: any) {
  return String(v ?? "").trim();
}

function sortByDateDesc(a: any, b: any, key: string) {
  return s(b?.[key]).localeCompare(s(a?.[key]));
}

function sortByDateAsc(a: any, b: any, key: string) {
  return s(a?.[key]).localeCompare(s(b?.[key]));
}

export default function TenantDashboardSinglePage() {
  const [home, setHome] = useState<any>(null);
  const [dash, setDash] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const [h, d] = await Promise.all([getTenantHomeData(), getTenantDashboard()]);
      setHome(h);
      setDash(d);
    } catch (e: any) {
      alert(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const contactHref = useMemo(() => {
    const w = home?.adminContact?.whatsappE164;
    if (!w) return "";
    const num = String(w).replace(/\s+/g, "");
    return `https://wa.me/${num.replace(/^\+/, "")}`;
  }, [home]);

  const summary = useMemo(() => {
    if (!dash) return null;

    const allocs = dash.allocations || [];
    const rentApplied = new Map<string, number>();
    const billApplied = new Map<string, number>();

    for (const a of allocs) {
      const amt = n(a.amount_applied);
      const rid = s(a.rent_id);
      const bid = s(a.bill_id);
      if (rid) rentApplied.set(rid, (rentApplied.get(rid) ?? 0) + amt);
      if (bid) billApplied.set(bid, (billApplied.get(bid) ?? 0) + amt);
    }

    const rents = (dash.rents || []).map((r: any) => {
      const expected = n(r.expected_amount);
      const applied = rentApplied.get(s(r.rent_id)) ?? 0;
      const balance = expected - applied;
      return { ...r, expected, applied, balance };
    });

    const bills = (dash.bills || []).map((b: any) => {
      const expected = n(b.expected_amount);
      const applied = billApplied.get(s(b.bill_id)) ?? 0;
      const balance = expected - applied;
      return { ...b, expected, applied, balance };
    });

    const rentExpected = rents.reduce((sum: number, r: any) => sum + n(r.expected), 0);
    const rentAppliedSum = rents.reduce((sum: number, r: any) => sum + n(r.applied), 0);
    const rentBalance = Math.max(0, rents.reduce((sum: number, r: any) => sum + Math.max(0, n(r.balance)), 0));

    const billExpected = bills.reduce((sum: number, b: any) => sum + n(b.expected), 0);
    const billAppliedSum = bills.reduce((sum: number, b: any) => sum + n(b.applied), 0);
    const billBalance = Math.max(0, bills.reduce((sum: number, b: any) => sum + Math.max(0, n(b.balance)), 0));

    const paymentsTotal = (dash.payments || []).reduce((sum: number, p: any) => sum + n(p.amount), 0);

    return {
      rents,
      bills,
      rentExpected,
      rentAppliedSum,
      rentBalance,
      billExpected,
      billAppliedSum,
      billBalance,
      totalBalance: rentBalance + billBalance,
      paymentsTotal
    };
  }, [dash]);

  const recentPayments = useMemo(() => {
    const list = (dash?.payments || []).slice().sort((a: any, b: any) => sortByDateDesc(a, b, "created_at"));
    return list.slice(0, 10);
  }, [dash]);

  const openRents = useMemo(() => {
    if (!summary) return [];
    return summary.rents
      .filter((r: any) => n(r.balance) > 0.000001)
      .slice()
      .sort((a: any, b: any) => sortByDateAsc(a, b, "due_date"))
      .slice(0, 8);
  }, [summary]);

  const openBills = useMemo(() => {
    if (!summary) return [];
    return summary.bills
      .filter((b: any) => n(b.balance) > 0.000001)
      .slice()
      .sort((a: any, b: any) => sortByDateAsc(a, b, "due_date"))
      .slice(0, 8);
  }, [summary]);

  if (loading && !home) {
    return <div className="text-sm text-gray-700">Loading...</div>;
  }

  const apt = home?.apartmentDetails;
  const bal = home?.balances;
  const pay = home?.paymentDetails;
  const admin = home?.adminContact;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Welcome, {home?.tenantFirstName}</h1>
          <p className="text-sm text-gray-700">
            Your dashboard shows your current apartment, balances, charges, and payments. Upload receipts after payment.
          </p>
        </div>

        <button className="rounded border px-3 py-2 text-sm" onClick={refresh}>
          Refresh
        </button>
      </div>

      {/* Current Apartment */}
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

      {/* Balances */}
      <section className="rounded border bg-white p-4 space-y-2">
        <div className="text-sm font-semibold">Balances</div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
          <div className="rounded border p-3">
            <div className="font-semibold">Rent</div>
            <div>₦{bal?.rentBalance ?? summary?.rentBalance ?? 0}</div>
          </div>
          <div className="rounded border p-3">
            <div className="font-semibold">Bills/Charges</div>
            <div>₦{bal?.billBalance ?? summary?.billBalance ?? 0}</div>
          </div>
          <div className="rounded border p-3">
            <div className="font-semibold">Total</div>
            <div>₦{bal?.totalBalance ?? summary?.totalBalance ?? 0}</div>
          </div>
        </div>

        {summary && (
          <div className="text-xs text-gray-600">
            Expected vs Paid: Rent ₦{summary.rentExpected} / ₦{summary.rentAppliedSum} • Bills ₦{summary.billExpected} / ₦{summary.billAppliedSum}
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section className="rounded border bg-white p-4 space-y-3">
        <div className="text-sm font-semibold">Quick Actions</div>

        <div className="flex flex-wrap gap-2">
          <InstallPWAButton /> {/* ✅ Added InstallPWAButton */}
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

        {(admin?.phoneE164 || admin?.email) && (
          <div className="text-xs text-gray-700">
            {admin.phoneE164 && <div><b>Admin Phone:</b> {admin.phoneE164}</div>}
            {admin.email && <div><b>Admin Email:</b> {admin.email}</div>}
          </div>
        )}
      </section>

      {/* Charges */}
      <section className="rounded border bg-white p-4 space-y-3">
        <div className="text-sm font-semibold">Open Charges</div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="rounded border p-3">
            <div className="font-semibold text-sm mb-2">Rent (Open)</div>
            {openRents.length === 0 ? (
              <div className="text-sm text-gray-600">No outstanding rent.</div>
            ) : (
              <div className="space-y-2">
                {openRents.map((r: any) => (
                  <div key={s(r.rent_id)} className="text-sm flex items-center justify-between gap-2">
                    <div>
                      <div><b>Due:</b> {s(r.due_date) || "—"}</div>
                      <div className="text-xs text-gray-600">Rent ID: {s(r.rent_id)}</div>
                    </div>
                    <div className="font-semibold">₦{Math.max(0, n(r.balance))}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded border p-3">
            <div className="font-semibold text-sm mb-2">Bills/Charges (Open)</div>
            {openBills.length === 0 ? (
              <div className="text-sm text-gray-600">No outstanding bills/charges.</div>
            ) : (
              <div className="space-y-2">
                {openBills.map((b: any) => (
                  <div key={s(b.bill_id)} className="text-sm flex items-center justify-between gap-2">
                    <div>
                      <div><b>Due:</b> {s(b.due_date) || "—"}</div>
                      <div className="text-xs text-gray-600">
                        {s(b.bill_name) ? `${s(b.bill_name)} • ` : ""}Bill ID: {s(b.bill_id)}
                      </div>
                    </div>
                    <div className="font-semibold">₦{Math.max(0, n(b.balance))}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recent payments */}
      <section className="rounded border bg-white p-4 space-y-3">
        <div className="text-sm font-semibold">Recent Payments</div>

        {recentPayments.length === 0 ? (
          <div className="text-sm text-gray-600">No payments recorded yet.</div>
        ) : (
          <div className="space-y-2">
            {recentPayments.map((p: any) => {
              const status = s(p.verification_status || "pending").toLowerCase();
              const receiptUrl = s(p.receipt_drive_file_url || "");
              return (
                <div key={s(p.payment_id)} className="rounded border p-3 text-sm space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold">Payment {s(p.payment_id)}</div>
                    <div className="font-semibold">₦{n(p.amount)}</div>
                  </div>
                  <div className="text-xs text-gray-700">
                    Date: {s(p.payment_date) || "—"} • Status: {status.toUpperCase()}
                    {s(p.pos_reference) ? ` • POS: ${s(p.pos_reference)}` : ""}
                  </div>

                  <div className="flex gap-2 items-center">
                    <Link className="underline text-xs" href="/tenant/submit-receipt">
                      Upload / Update Receipt
                    </Link>

                    {receiptUrl && (
                      <a className="underline text-xs" href={receiptUrl} target="_blank" rel="noreferrer">
                        View Receipt
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Payment account details */}
      <section className="rounded border bg-white p-4 space-y-2">
        <div className="text-sm font-semibold">Payment Account Details</div>

        {(pay?.accountNumber || pay?.bankName || pay?.accountName) ? (
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

      {/* Technical transparency */}
      {dash && (
        <details className="text-sm">
          <summary className="cursor-pointer font-semibold">View Raw Data (JSON)</summary>
          <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs">
            {JSON.stringify(dash, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
