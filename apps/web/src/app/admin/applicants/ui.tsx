"use client";

import { useEffect, useMemo, useState } from "react";

type Applicant = {
  applicant_id: string;
  full_name: string;
  phone: string;
  email: string;
  status: string;
  kyc_status: string;
  preferred_apartment_type: string;
  preferred_area: string;
  submitted_at: string;
};

function badgeClass(v: string) {
  const s = (v || "").toUpperCase();
  if (s === "APPROVED" || s === "PROMOTED") return "border-green-200 bg-green-50 text-green-800";
  if (s === "REJECTED") return "border-red-200 bg-red-50 text-red-800";
  if (s === "PENDING_APPROVAL") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-gray-200 bg-gray-50 text-gray-800";
}

export default function ApplicantsAdminClient() {
  const [items, setItems] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string>("");
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const r = await fetch("/api/admin/applicants", { cache: "no-store" });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErr(data?.error || "Failed to load applicants.");
        setItems([]);
      } else {
        setItems(Array.isArray(data?.items) ? data.items : []);
      }
    } catch (e: any) {
      setErr(e?.message || "Failed to load applicants.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const pending = useMemo(
    () =>
      items.filter(
        (i) => (i.status || "").toUpperCase() === "PENDING_APPROVAL" && (i.kyc_status || "").toUpperCase() === "SUBMITTED"
      ),
    [items]
  );

  const approved = useMemo(
    () => items.filter((i) => (i.status || "").toUpperCase() === "APPROVED"),
    [items]
  );

  const promoted = useMemo(
    () => items.filter((i) => (i.status || "").toUpperCase() === "PROMOTED"),
    [items]
  );

  async function act(applicantId: string, action: "approve" | "reject" | "promote") {
    setErr("");
    setBusyId(applicantId);
    try {
      const r = await fetch("/api/admin/applicants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicantId, action })
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        const msg = data?.error || "Action failed.";
        setErr(msg === "KYC_NOT_SUBMITTED" ? "Cannot promote: KYC not submitted." :
               msg === "NOT_APPROVED" ? "Cannot promote: applicant is not approved." :
               msg);
        return;
      }
      await load();
    } catch (e: any) {
      setErr(e?.message || "Action failed.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Applicants</h1>
          <p className="mt-1 text-sm text-gray-600">
            Review applications. Approve, reject, then promote to Tenant when ready.
          </p>
        </div>

        <button
          onClick={load}
          className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {err ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 rounded-md border bg-white p-4 text-sm">Loading…</div>
      ) : (
        <div className="mt-6 space-y-8">
          <Section
            title={`Pending approvals (${pending.length})`}
            items={pending}
            busyId={busyId}
            onApprove={(id) => act(id, "approve")}
            onReject={(id) => act(id, "reject")}
            onPromote={(id) => act(id, "promote")}
            showPromote={false}
          />

          <Section
            title={`Approved (ready to promote) (${approved.length})`}
            items={approved}
            busyId={busyId}
            onApprove={(id) => act(id, "approve")}
            onReject={(id) => act(id, "reject")}
            onPromote={(id) => act(id, "promote")}
            showPromote={true}
          />

          <Section
            title={`Promoted to tenants (${promoted.length})`}
            items={promoted}
            busyId={busyId}
            onApprove={() => {}}
            onReject={() => {}}
            onPromote={() => {}}
            showPromote={false}
            readonly
          />
        </div>
      )}
    </div>
  );
}

function Section(props: {
  title: string;
  items: Applicant[];
  busyId: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onPromote: (id: string) => void;
  showPromote: boolean;
  readonly?: boolean;
}) {
  const { title, items, busyId, onApprove, onReject, onPromote, showPromote, readonly } = props;

  return (
    <section className="rounded-lg border bg-white">
      <div className="border-b bg-gray-50 px-4 py-3 text-sm font-semibold">{title}</div>

      {items.length === 0 ? (
        <div className="px-4 py-6 text-sm text-gray-600">No items.</div>
      ) : (
        <div className="divide-y">
          {items.map((a) => {
            const busy = busyId === a.applicant_id;
            return (
              <div key={a.applicant_id} className="px-4 py-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-medium">{a.full_name}</div>
                      <span className={`rounded-md border px-2 py-1 text-xs ${badgeClass(a.status)}`}>
                        {a.status}
                      </span>
                      <span className={`rounded-md border px-2 py-1 text-xs ${badgeClass(a.kyc_status)}`}>
                        KYC: {a.kyc_status}
                      </span>
                    </div>

                    <div className="mt-2 text-sm text-gray-700">
                      <div><span className="text-gray-500">Email:</span> {a.email || "-"}</div>
                      <div><span className="text-gray-500">Phone:</span> {a.phone || "-"}</div>
                      <div className="mt-2">
                        <span className="text-gray-500">Preference:</span>{" "}
                        {a.preferred_apartment_type ? `${a.preferred_apartment_type}` : "-"}
                        {a.preferred_area ? ` • ${a.preferred_area}` : ""}
                      </div>
                      {a.submitted_at ? (
                        <div className="mt-1 text-xs text-gray-500">Submitted: {a.submitted_at}</div>
                      ) : null}
                    </div>
                  </div>

                  {!readonly ? (
                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <button
                        disabled={busy}
                        onClick={() => onApprove(a.applicant_id)}
                        className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                      >
                        Approve
                      </button>

                      <button
                        disabled={busy}
                        onClick={() => onReject(a.applicant_id)}
                        className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 hover:bg-red-100 disabled:opacity-60"
                      >
                        Reject
                      </button>

                      {showPromote ? (
                        <button
                          disabled={busy}
                          onClick={() => onPromote(a.applicant_id)}
                          className="rounded-md bg-black px-3 py-2 text-sm text-white hover:opacity-90 disabled:opacity-60"
                        >
                          Promote → Tenant
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Promote creates a Tenant record (so admin can bond to an apartment later).
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
