"use client";

import { useState } from "react";
import { adminLogin } from "@/app/actions/admin-auth";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      await adminLogin({ email, password });
      window.location.href = "/admin";
    } catch (e: any) {
      alert(e?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function demoLogin() {
    setDemoBusy(true);
    try {
      const r = await fetch("/api/dev/demo/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email || "admin@demo.local",
          password: password || "Admin12345!"
        })
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        throw new Error(data?.error || "Demo login failed");
      }

      window.location.href = "/admin";
    } catch (e: any) {
      alert(e?.message || "Demo login failed");
    } finally {
      setDemoBusy(false);
    }
  }

  const isDev = process.env.NODE_ENV !== "production";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded border bg-white p-6 space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Admin Login</h1>
          <p className="text-sm text-gray-700">
            This page is private and not shown on the public site.
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-sm">Email</label>
          <input
            className="w-full border p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            autoComplete="email"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm">Password</label>
          <input
            className="w-full border p-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        <button
          className="w-full rounded bg-black px-4 py-2 text-white text-sm disabled:opacity-60"
          onClick={submit}
          disabled={busy || demoBusy}
        >
          {busy ? "Signing in..." : "Sign In"}
        </button>

        {isDev ? (
          <button
            className="w-full rounded border px-4 py-2 text-sm disabled:opacity-60 hover:bg-gray-50"
            onClick={demoLogin}
            disabled={busy || demoBusy}
            title="Development only"
          >
            {demoBusy ? "Signing in (demo)..." : "Demo Login (Dev Only)"}
          </button>
        ) : null}

        <div className="text-xs text-gray-600">
          If no admin users exist yet, use the bootstrap admin credentials from environment variables.
        </div>
      </div>
    </div>
  );
}
