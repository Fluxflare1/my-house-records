"use client";

import { useState } from "react";
import { handleAdminClientError } from "@/lib/ui/admin-error";
import { generateCurrentYearlyRentForActiveOccupancies } from "@/app/actions/generate-yearly-rent";

export default function GenerateRentPage() {
  const [dueInDays, setDueInDays] = useState(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function run() {
    setBusy(true);
    setResult(null);
    try {
      const r = await generateCurrentYearlyRentForActiveOccupancies({ dueInDays });
      setResult(r);
      alert(`Done. Created ${r.created}, skipped ${r.skipped}`);
    } catch (e: any) {
      if (handleAdminClientError(e)) return;
      alert(e?.message || "Failed to generate rent");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Generate Yearly Rent</h1>
        <p className="text-sm text-gray-700">
          Creates the <b>current</b> yearly rent record for each <b>active occupancy</b>, aligned to occupancy start-date anniversary.
          No duplicates.
        </p>
      </div>

      <section className="rounded border bg-white p-4 space-y-3">
        <div className="space-y-1">
          <label className="text-sm">Due in days (0 = due on period start)</label>
          <input className="w-full border p-2" type="number" value={dueInDays} onChange={(e) => setDueInDays(Number(e.target.value))} />
        </div>

        <button className="rounded bg-black px-4 py-2 text-white text-sm" onClick={run} disabled={busy}>
          {busy ? "Generating..." : "Generate Rent"}
        </button>

        <div className="text-xs text-gray-600">
          Amount is derived from apartment type <b>yearly_rent_amount</b>.
        </div>
      </section>

      {result && (
        <details className="text-sm">
          <summary className="cursor-pointer font-semibold">View result (JSON)</summary>
          <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
