"use client";

import { useEffect, useMemo, useState } from "react";
import { handleAdminClientError } from "@/lib/ui/admin-error";
import { getRecentPayments } from "@/app/actions/admin-payments-ux";
import { suggestAllocationsForPayment, applyAllocations } from "@/app/actions/allocations";

function n(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

export default function AllocationSuggestPage() {
  const [payments, setPayments] = useState<{ paymentId: string; label: string; verificationStatus: string; receiptUrl: string }[]>([]);
  const [paymentId, setPaymentId] = useState("");
  const [busy, setBusy] = useState(false);

  const [suggestion, setSuggestion] = useState<any>(null);
  const [selected, setSelected] = useState<Record<string, number>>({}); // key = kind:id

  async function loadPayments() {
    try {
      const p = await getRecentPayments(50);
      setPayments(p);
    } catch (e: any) {
      if (handleAdminClientError(e)) return;
      alert(e?.message || "Failed to load payments");
    }
  }

  useEffect(() => {
    loadPayments();
  }, []);

  async function runSuggest() {
    if (!paymentId) return alert("Select a payment");
    setBusy(true);
    try {
      const s = await suggestAllocationsForPayment({ paymentId });
      setSuggestion(s);

      // Default-select the suggested amounts
      const next: Record<string, number> = {};
      for (const it of s.suggestions || []) {
        next[`${it.kind}:${it.targetId}`] = n(it.amount);
      }
      setSelected(next);
    } catch (e: any) {
      if (handleAdminClientError(e)) return;
      alert(e?.message || "Failed to suggest allocations");
    } finally {
      setBusy(false);
    }
  }

  const totalSelected = useMemo(() => {
    return Object.values(selected).reduce((sum, v) => sum + n(v), 0);
  }, [selected]);

  async function apply() {
    if (!suggestion?.paymentId) return alert("Run suggestion first");
    const items = Object.entries(selected)
      .map(([k, amt]) => {
        const [kind, id] = k.split(":");
        return { kind: kind as "rent" | "bill", targetId: id, amount: n(amt) };
      })
      .filter((x) => x.amount > 0);

    if (items.length === 0) return alert("No allocation amounts selected");

    if (!confirm(`Apply allocations totaling ₦${totalSelected}?`)) return;

    setBusy(true);
    try {
      await applyAllocations({ paymentId: suggestion.paymentId, items });
      alert("Allocations applied.");
      setSuggestion(null);
      setSelected({});
    } catch (e: any) {
      if (handleAdminClientError(e)) return;
      alert(e?.message || "Failed to apply allocations");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Allocation Suggestion</h1>
        <p className="text-sm text-gray-700">
          Select a payment, auto-suggest allocations to the <b>oldest outstanding</b> rent/bills for that apartment (across occupancy history).
        </p>
      </div>

      <section className="rounded border bg-white p-4 space-y-3">
        <div className="text-sm font-semibold">Step 1 — Choose Payment</div>

        <select className="w-full border p-2" value={paymentId} onChange={(e) => setPaymentId(e.target.value)} disabled={busy}>
          <option value="">Select payment…</option>
          {payments.map((p) => (
            <option key={p.paymentId} value={p.paymentId}>
              {p.label}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <button className="rounded bg-black px-4 py-2 text-white text-sm" onClick={runSuggest} disabled={busy}>
            {busy ? "Working..." : "Suggest Allocations"}
          </button>
          <button className="rounded border px-4 py-2 text-sm" onClick={loadPayments} disabled={busy}>
            Refresh Payments
          </button>
        </div>
      </section>

      {suggestion && (
        <section className="rounded border bg-white p-4 space-y-3">
          <div className="text-sm font-semibold">Step 2 — Review & Apply</div>

          <div className="text-sm">
            <div><b>Payment:</b> {suggestion.paymentId}</div>
            <div><b>Apartment:</b> {suggestion.apartmentId}</div>
            <div><b>Amount:</b> ₦{suggestion.paymentAmount}</div>
            <div><b>Already allocated:</b> ₦{suggestion.alreadyAllocated}</div>
            <div><b>Available:</b> ₦{suggestion.availableToAllocate}</div>
          </div>

          {(suggestion.suggestions?.length || 0) === 0 ? (
            <div className="text-sm text-gray-700">
              No outstanding debts found for this apartment, or no allocatable amount.
            </div>
          ) : (
            <div className="space-y-2">
              {suggestion.suggestions.map((it: any) => {
                const key = `${it.kind}:${it.targetId}`;
                const val = selected[key] ?? 0;

                return (
                  <div key={key} className="rounded border p-3 text-sm space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold">{it.kind.toUpperCase()}</div>
                      <div className="text-xs text-gray-600">Due: {it.dueDate || "—"}</div>
                    </div>
                    <div className="text-xs text-gray-700">{it.label}</div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600">Allocate (₦)</label>
                      <input
                        className="border p-2 text-sm w-40"
                        type="number"
                        value={val}
                        onChange={(e) => setSelected((p) => ({ ...p, [key]: Number(e.target.value) }))}
                      />
                      <button
                        className="text-xs underline"
                        onClick={() => setSelected((p) => ({ ...p, [key]: 0 }))}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-2">
            <div className="text-sm">
              <b>Total selected:</b> ₦{totalSelected}
            </div>
            <button className="rounded bg-black px-4 py-2 text-white text-sm" onClick={apply} disabled={busy}>
              Apply Allocations
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
