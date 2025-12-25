"use client";

import { useEffect, useMemo, useState } from "react";
import { getAllSettings, upsertSettingsBulk } from "@/app/actions/admin-settings";
import { handleAdminClientError } from "@/lib/ui/admin-error";

function s(v: any) {
  return String(v ?? "").trim();
}

function boolToStr(b: boolean) {
  return b ? "true" : "false";
}
function strToBool(v: string) {
  return String(v || "").toLowerCase() === "true";
}

type KV = { key: string; value: string };

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<KV[]>([]);
  const [saving, setSaving] = useState(false);

  const [publishPaymentDetails, setPublishPaymentDetails] = useState(false);

  const [paymentBankName, setPaymentBankName] = useState("");
  const [paymentAccountName, setPaymentAccountName] = useState("");
  const [paymentAccountNumber, setPaymentAccountNumber] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  const [adminWhatsAppE164, setAdminWhatsAppE164] = useState("");
  const [adminPhoneE164, setAdminPhoneE164] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  const kv = useMemo(() => new Map(rows.map((r) => [r.key, r.value])), [rows]);

  async function load() {
    setLoading(true);
    try {
      const data = await getAllSettings();
      setRows(data);

      const get = (k: string) => s(data.find((x) => x.key === k)?.value || "");

      setPublishPaymentDetails(strToBool(get("tenant_payment_details_published") || "false"));

      setPaymentBankName(get("payment_bank_name"));
      setPaymentAccountName(get("payment_account_name"));
      setPaymentAccountNumber(get("payment_account_number"));
      setPaymentNote(get("payment_note"));

      setAdminWhatsAppE164(get("admin_whatsapp_e164"));
      setAdminPhoneE164(get("admin_phone_e164"));
      setAdminEmail(get("admin_email"));
    } catch (e: any) {
      if (handleAdminClientError(e)) return;
      alert(e?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    setSaving(true);
    try {
      const items: KV[] = [
        { key: "tenant_payment_details_published", value: boolToStr(publishPaymentDetails) },

        { key: "payment_bank_name", value: paymentBankName },
        { key: "payment_account_name", value: paymentAccountName },
        { key: "payment_account_number", value: paymentAccountNumber },
        { key: "payment_note", value: paymentNote },

        { key: "admin_whatsapp_e164", value: adminWhatsAppE164 },
        { key: "admin_phone_e164", value: adminPhoneE164 },
        { key: "admin_email", value: adminEmail }
      ];

      await upsertSettingsBulk(items);
      alert("Settings saved");
      await load();
    } catch (e: any) {
      if (handleAdminClientError(e)) return;
      alert(e?.message || "Failed to save settings. Ensure the 'settings' sheet exists with headers: key, value.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <section className="rounded border bg-white p-4 space-y-4">
        <div className="text-sm font-semibold">Tenant-visible settings</div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={publishPaymentDetails}
            onChange={(e) => setPublishPaymentDetails(e.target.checked)}
            disabled={loading || saving}
          />
          Publish payment account details to tenants
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm">Bank Name</label>
            <input className="w-full border p-2" value={paymentBankName} onChange={(e) => setPaymentBankName(e.target.value)} disabled={loading || saving} />
          </div>

          <div className="space-y-1">
            <label className="text-sm">Account Name</label>
            <input className="w-full border p-2" value={paymentAccountName} onChange={(e) => setPaymentAccountName(e.target.value)} disabled={loading || saving} />
          </div>

          <div className="space-y-1">
            <label className="text-sm">Account Number</label>
            <input className="w-full border p-2" value={paymentAccountNumber} onChange={(e) => setPaymentAccountNumber(e.target.value)} disabled={loading || saving} />
          </div>

          <div className="space-y-1">
            <label className="text-sm">Payment Note (optional)</label>
            <input className="w-full border p-2" value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} disabled={loading || saving} />
          </div>
        </div>
      </section>

      <section className="rounded border bg-white p-4 space-y-4">
        <div className="text-sm font-semibold">Admin contact (used by tenant “Contact Admin”)</div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-sm">WhatsApp (E.164)</label>
            <input className="w-full border p-2" placeholder="+2348XXXXXXXXX" value={adminWhatsAppE164} onChange={(e) => setAdminWhatsAppE164(e.target.value)} disabled={loading || saving} />
          </div>

          <div className="space-y-1">
            <label className="text-sm">Phone (E.164)</label>
            <input className="w-full border p-2" placeholder="+2348XXXXXXXXX" value={adminPhoneE164} onChange={(e) => setAdminPhoneE164(e.target.value)} disabled={loading || saving} />
          </div>

          <div className="space-y-1">
            <label className="text-sm">Email</label>
            <input className="w-full border p-2" placeholder="admin@example.com" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} disabled={loading || saving} />
          </div>
        </div>
      </section>

      <section className="rounded border bg-white p-4 space-y-2">
        <button className="rounded bg-black px-4 py-2 text-white text-sm" onClick={save} disabled={loading || saving}>
          {saving ? "Saving..." : "Save Settings"}
        </button>
        <button className="rounded border px-4 py-2 text-sm" onClick={load} disabled={loading || saving}>
          Reload
        </button>

        <div className="text-xs text-gray-600">
          Requires a Google Sheet tab named <b>settings</b> with headers: <b>key</b>, <b>value</b>.
        </div>
      </section>

      <details className="text-sm">
        <summary className="cursor-pointer font-semibold">View raw settings (debug)</summary>
        <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs">
          {JSON.stringify(rows, null, 2)}
        </pre>
      </details>
    </div>
  );
}
