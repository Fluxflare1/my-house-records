"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApplicantLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");

    try {
      const r = await fetch("/api/applicant/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErr(data?.error || "Login failed.");
        setLoading(false);
        return;
      }

      // server tells where to go next
      router.push(data?.next || "/applicant");
    } catch (e: any) {
      setErr(e?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Email</label>
        <input name="email" type="email" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="text-sm font-medium">Password</label>
        <input name="password" type="password" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
      </div>

      {err ? <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div> : null}

      <button
        disabled={loading}
        className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
