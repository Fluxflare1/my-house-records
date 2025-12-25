"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ApartmentType = { name: string };

export default function ApplicantKycForm() {
  const router = useRouter();
  const [types, setTypes] = useState<ApartmentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/public/apartment-types");
        const data = await r.json();
        setTypes(Array.isArray(data?.types) ? data.types : []);
      } catch {
        setTypes([]);
      }
    })();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const preferredApartmentType = String(fd.get("preferredApartmentType") || "");
    const preferredArea = String(fd.get("preferredArea") || "");

    if (!preferredApartmentType || !preferredArea) {
      setErr("Please choose apartment type and enter preferred area/property.");
      setLoading(false);
      return;
    }

    try {
      const r = await fetch("/api/applicant/submit-kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredApartmentType, preferredArea })
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErr(data?.error || "Submission failed.");
        setLoading(false);
        return;
      }

      router.push("/applicant");
    } catch (e: any) {
      setErr(e?.message || "Submission failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Preferred apartment type *</label>
        <select name="preferredApartmentType" className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
          <option value="">Select…</option>
          {types.map((t) => (
            <option key={t.name} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          You will not select an internal apartment unit. Admin assigns the exact unit after approval.
        </p>
      </div>

      <div>
        <label className="text-sm font-medium">Preferred area / property *</label>
        <input
          name="preferredArea"
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          placeholder="e.g., Ojo, Festac, or 'Near XYZ junction'"
        />
      </div>

      {err ? <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div> : null}

      <button
        disabled={loading}
        className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
}
