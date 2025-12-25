"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getTenantHomeData } from "@/app/actions/tenant-home";

type TenantHome = {
  firstName?: string;
  apartmentLabel?: string;
  apartmentType?: string;
  propertyName?: string;
  currentBalance?: number;
  posAccountName?: string;
  posAccountNumber?: string;
  posBankName?: string;
};

export default function TenantClient() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TenantHome | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await getTenantHomeData();
        if (!alive) return;
        setData(r || null);
        setError("");
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Failed to load tenant dashboard");
        setData(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="rounded border bg-white p-4 text-sm">Loading tenant…</div>
      </div>
    );
  }

  // If not logged in, show a clean prompt to login
  if (!data || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded border bg-white p-6 space-y-3">
          <h1 className="text-xl font-semibold">Tenant Access Required</h1>
          <p className="text-sm text-gray-700">
            Please login to access your dashboard.
          </p>
          <Link className="inline-flex rounded bg-black px-4 py-2 text-white text-sm" href="/login/tenant">
            Go to Tenant Login
          </Link>
        </div>
      </div>
    );
  }

  const welcomeName = data.firstName ? `, ${data.firstName}` : "";
  const balance =
    typeof data.currentBalance === "number"
      ? data.currentBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })
      : "—";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-5">
        <div className="rounded border bg-white p-6">
          <h1 className="text-2xl font-semibold">Welcome{welcomeName}</h1>
          <p className="mt-1 text-sm text-gray-600">
            Here is your current apartment and account summary.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded border bg-white p-6 space-y-2">
            <h2 className="font-semibold">Current Apartment</h2>
            <div className="text-sm text-gray-700 space-y-1">
              <div><span className="text-gray-500">Apartment:</span> {data.apartmentLabel || "—"}</div>
              <div><span className="text-gray-500">Type:</span> {data.apartmentType || "—"}</div>
              <div><span className="text-gray-500">Property:</span> {data.propertyName || "—"}</div>
            </div>
          </div>

          <div className="rounded border bg-white p-6 space-y-2">
            <h2 className="font-semibold">Current Balance</h2>
            <div className="text-3xl font-semibold">₦{balance}</div>
            <p className="text-sm text-gray-600">
              Balance is based on rent + bills minus payments (for your occupancy period).
            </p>
          </div>
        </div>

        <div className="rounded border bg-white p-6 space-y-3">
          <h2 className="font-semibold">Payment Account</h2>
          <p className="text-sm text-gray-700">
            Use this account for transfers. After payment, upload your receipt.
          </p>

          <div className="grid gap-2 text-sm">
            <div><span className="text-gray-500">Account Name:</span> {data.posAccountName || "—"}</div>
            <div><span className="text-gray-500">Account Number:</span> {data.posAccountNumber || "—"}</div>
            <div><span className="text-gray-500">Bank:</span> {data.posBankName || "—"}</div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link className="rounded bg-black px-4 py-2 text-white text-sm" href="/tenant/statement">
              View Statement
            </Link>
            <Link className="rounded border px-4 py-2 text-sm hover:bg-gray-50" href="/tenant/upload-receipt">
              Upload Receipt
            </Link>
            <Link className="rounded border px-4 py-2 text-sm hover:bg-gray-50" href="/tenant/contact-admin">
              Contact Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
