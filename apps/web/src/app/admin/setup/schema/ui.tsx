"use client";

import { useState } from "react";

export default function EnsureSchemaClient() {
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState<any>(null);
  const [err, setErr] = useState("");

  async function run() {
    setErr("");
    setOut(null);
    setLoading(true);
    try {
      const r = await fetch("/api/admin/system/ensure-schema", { method: "POST" });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErr(data?.error || "Failed");
      } else {
        setOut(data);
      }
    } catch (e: any) {
      setErr(e?.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Ensure Google Sheet Schema</h1>
      <p className="mt-2 text-sm text-gray-600">
        This creates missing tabs and ensures required headers exist (including <b>tenant_id</b> in applicants).
      </p>

      {err ? (
        <div className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      <button
        onClick={run}
        disabled={loading}
        className="mt-5 rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Working..." : "Run Ensure Schema"}
      </button>

      {out ? (
        <pre className="mt-6 overflow-auto rounded-md border bg-gray-50 p-3 text-xs">
          {JSON.stringify(out, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
