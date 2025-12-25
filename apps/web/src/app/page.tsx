import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      {/* HERO */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-gray-600">
              <span className="h-2 w-2 rounded-full bg-black" />
              Manage house records with clarity
            </div>

            <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
              Keep Occupancy, Rent, Bills & Payments{" "}
              <span className="text-gray-500">traceable by period</span>
            </h1>

            <p className="mt-4 text-base text-gray-600 md:text-lg">
              This system answers one key question:{" "}
              <span className="font-medium text-gray-900">
                who occupied which apartment, during which period, and what was the financial state?
              </span>
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/request-access"
                className="w-full rounded-md bg-black px-5 py-3 text-center text-sm font-medium text-white hover:opacity-90 sm:w-auto"
              >
                Request for Access
              </Link>

              <Link
                href="/login/tenant"
                className="w-full rounded-md border px-5 py-3 text-center text-sm font-medium hover:bg-gray-50 sm:w-auto"
              >
                Login
              </Link>

              <a
                href="#contact"
                className="w-full rounded-md border px-5 py-3 text-center text-sm font-medium hover:bg-gray-50 sm:w-auto"
              >
                Contact
              </a>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
              <div className="rounded-lg border p-4">
                <div className="text-xs text-gray-500">For</div>
                <div className="mt-1 text-sm font-semibold">House Owners</div>
                <div className="mt-1 text-sm text-gray-600">Track everything without losing history.</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-xs text-gray-500">For</div>
                <div className="mt-1 text-sm font-semibold">Property Managers</div>
                <div className="mt-1 text-sm text-gray-600">Statements, debt tracking, verification.</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-xs text-gray-500">For</div>
                <div className="mt-1 text-sm font-semibold">Tenants</div>
                <div className="mt-1 text-sm text-gray-600">View statement, upload receipt, stay informed.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="border-t bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold md:text-3xl">What it helps you manage</h2>
            <p className="mt-3 text-sm text-gray-600 md:text-base">
              Built for record-keeping and traceability, not public listing marketplaces.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Occupancy history",
                text: "Who stayed where and when — always preserved."
              },
              {
                title: "Rent + bills tracking",
                text: "Rent and monthly charges tracked separately with clear periods."
              },
              {
                title: "Payments + allocations",
                text: "Record payments and apply them to the oldest balances first."
              },
              {
                title: "Statements",
                text: "Generate period-based statements per occupancy or apartment."
              },
              {
                title: "Receipts & documents",
                text: "Store receipts and agreements in a structured folder."
              },
              {
                title: "Admin roles",
                text: "Access control for rent-only, bills-only, or full admin."
              }
            ].map((f) => (
              <div key={f.title} className="rounded-lg border bg-white p-5">
                <div className="text-sm font-semibold">{f.title}</div>
                <div className="mt-2 text-sm text-gray-600">{f.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AVAILABILITY */}
      <section id="availability" className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold md:text-3xl">Availability</h2>
              <p className="mt-2 text-sm text-gray-600">
                Simple publishing for what’s available. No pictures required — contact us to inspect.
              </p>
            </div>

            <a
              href="#contact"
              className="inline-flex w-fit items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Book inspection / Contact
            </a>
          </div>

          {/* To Let table (no mock data) */}
          <div className="mt-8 rounded-lg border">
            <div className="border-b bg-gray-50 px-4 py-3 text-sm font-semibold">To Let</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b">
                  <tr className="text-gray-600">
                    <th className="px-4 py-3">Apartment Type</th>
                    <th className="px-4 py-3">Area / Property</th>
                    <th className="px-4 py-3">Rent (Year)</th>
                    <th className="px-4 py-3">Monthly Charges</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-6 text-gray-600" colSpan={6}>
                      No published vacancies yet.
                      <span className="ml-2 text-gray-500">
                        (Admin will publish available units here.)
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* For Sale table (optional) */}
          <div className="mt-6 rounded-lg border">
            <div className="border-b bg-gray-50 px-4 py-3 text-sm font-semibold">For Sale (Optional)</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b">
                  <tr className="text-gray-600">
                    <th className="px-4 py-3">Area / Property</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-6 text-gray-600" colSpan={4}>
                      No sale listings published.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 rounded-lg border bg-gray-50 p-5">
            <div className="text-sm font-semibold">How it works</div>
            <ol className="mt-3 grid gap-3 text-sm text-gray-700 md:grid-cols-5">
              <li className="rounded-md bg-white p-3 border">1) Request for Access</li>
              <li className="rounded-md bg-white p-3 border">2) Submit application/KYC</li>
              <li className="rounded-md bg-white p-3 border">3) Admin reviews</li>
              <li className="rounded-md bg-white p-3 border">4) Approval + payment advice</li>
              <li className="rounded-md bg-white p-3 border">5) Bond to apartment (occupancy starts)</li>
            </ol>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="border-t bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold md:text-3xl">Contact</h2>
            <p className="mt-3 text-sm text-gray-600 md:text-base">
              For inspections, enquiries, or to request access, use the contact option below.
            </p>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#"
                className="w-full rounded-md bg-black px-5 py-3 text-center text-sm font-medium text-white hover:opacity-90 sm:w-auto"
                aria-disabled="true"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Admin will publish contact details in Settings. (We will wire this next.)");
                }}
              >
                Contact on WhatsApp
              </a>
              <Link
                href="/request-access"
                className="w-full rounded-md border px-5 py-3 text-center text-sm font-medium hover:bg-gray-50 sm:w-auto"
              >
                Request for Access
              </Link>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              Note: contact details will be published by admin (so tenants/public never see admin pages).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
