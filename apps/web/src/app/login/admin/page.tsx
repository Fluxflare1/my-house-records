"use client";

import { useState } from "react";
import { adminLogin } from "@/app/actions/auth-admin";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit() {
    try {
      if (!email || !password) return alert("Email and password required");
      await adminLogin({ email, password });
      window.location.href = "/admin";
    } catch (e: any) {
      alert(e?.message || "Login failed");
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Admin Login</h1>

      <input className="w-full border p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full border p-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

      <button className="w-full rounded bg-black px-4 py-2 text-white" onClick={submit}>
        Login
      </button>
    </div>
  );
}
