"use client";

import { useEffect, useState } from "react";

type Props = {
  tenantFirstName?: string;
  tenantId?: string;
  onContinue: () => void;
};

function keyFor(tenantId?: string) {
  const id = String(tenantId || "unknown").trim() || "unknown";
  return `mhr_tenant_welcome_seen_${id}`;
}

export default function TenantWelcome({ tenantFirstName, tenantId, onContinue }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const k = keyFor(tenantId);
    const seen = localStorage.getItem(k) === "true";
    setShow(!seen);
  }, [tenantId]);

  function continueNow() {
    const k = keyFor(tenantId);
    localStorage.setItem(k, "true");
    setShow(false);
    onContinue();
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="mx-auto max-w-xl px-6 py-12 min-h-screen flex flex-col justify-center gap-6">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-gray-600">My House Records</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome{tenantFirstName ? `, ${tenantFirstName}` : ""} 👋
          </h1>
          <p className="text-sm text-gray-700">
            This portal helps you track your rent, bills/charges, payment receipts, and statements — all in one place.
          </p>
        </div>

        <div className="rounded-xl border bg-gray-50 p-4 space-y-2 text-sm">
          <div className="font-semibold">What you can do here</div>
          <ul className="list-disc pl-5 space-y-1 text-gray-800">
            <li>See your current apartment and balance</li>
            <li>View outstanding rent and bills/charges</li>
            <li>Upload a payment receipt after transfer</li>
            <li>Contact admin when needed</li>
          </ul>
        </div>

        <div className="rounded-xl border p-4 text-sm space-y-2">
          <div className="font-semibold">Quick tip</div>
          <p className="text-gray-700">
            Always include a clear transfer narration or POS reference when possible. It helps verification.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button className="rounded bg-black px-5 py-3 text-white text-sm" onClick={continueNow}>
            Continue to Dashboard
          </button>
          <button
            className="rounded border px-5 py-3 text-sm"
            onClick={() => {
              // Allow skip (still mark as seen)
              continueNow();
            }}
          >
            Skip
          </button>
        </div>

        <div className="text-xs text-gray-500">
          This message shows only once on this device.
        </div>
      </div>
    </div>
  );
}
