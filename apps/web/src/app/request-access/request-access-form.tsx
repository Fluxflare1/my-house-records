"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RequestAccessForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const payload = {
      firstName: String(fd.get("firstName") || ""),
      middleName: String(fd.get("middleName") || ""),
      lastName: String(fd.get("lastName") || ""),
      phone: String(fd.get("phone") || ""),
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
      confirm: String(fd.get("confirm") || "")
    };

    if (!payload.firstName || !payload.lastName || !payload.phone || !payload.email || !payload.password) {
      setErr("Please fill all required fields.");
      setLoading(false);
      return;
    }
    if (payload.password.length < 8) {
      setErr("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }
    if (payload.password !== payload.confirm) {
      setErr("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const r = await fetch("/api/applicant/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErr(data?.error || "Request failed.");
        setLoading(false);
        return;
      }

      router.push("/login/applicant?created=1");
    } catch (e: any) {
      setErr(e?.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium">First name *</label>
          <input name="firstName" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Middle name</label>
          <input name="middleName" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Surname *</label>
          <input name="lastName" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Phone *</label>
          <input name="phone" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Email *</label>
          <input name="email" type="email" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Password *</label>
          <input name="password" type="password" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Confirm password *</label>
          <input name="confirm" type="password" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
        </div>
      </div>

      {err ? <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div> : null}

      <button
        disabled={loading}
        className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}
