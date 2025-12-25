import Link from "next/link";

export default function PublicLandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="font-semibold tracking-tight">My House Records</div>

          {/* Intentionally NO admin link here */}
          <nav className="flex items-center gap-2">
            <Link
              href="/login/tenant"
              className="rounded bg-black px-4 py-2 text-sm text-white"
            >
              Tenant Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-5">
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
              Clear rent & bills records.
              <br />
              Faster verification.
              <br />
              Better statements.
            </h1>

            <p className="text-gray-700 text-base md:text-lg">
              My House Records helps tenants and property managers track rent, bills/charges,
              payments, receipts, balances, and statements — without confusion.
            </p>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/login/tenant"
                className="rounded bg-black px-5 py-3 text-sm text-white"
              >
                Tenant Login
              </Link>

              <a
                href="#how-it-works"
                className="rounded border px-5 py-3 text-sm"
              >
                How it works
              </a>
            </div>

            <div className="text-xs text-gray-600">
              Note: Receipt upload and statements are available <b>after</b> tenant login.
            </div>
          </div>

          {/* Simple “value card” */}
          <div className="rounded-xl border bg-gray-50 p-6 space-y-4">
            <div className="text-sm font-semibold">What tenants get</div>
            <ul className="space-y-2 text-sm text-gray-800">
              <li>• A dashboard showing current apartment and balances</li>
              <li>• Clear statement view: rent vs bills/charges</li>
              <li>• Receipt upload with acknowledgement</li>
              <li>• Notifications when payments are updated</li>
            </ul>

            <div className="text-xs text-gray-600">
              Built to grow: can evolve into a full SaaS later.
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
            How it works
          </h2>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border p-5">
              <div className="text-sm font-semibold">1) Login</div>
              <p className="mt-2 text-sm text-gray-700">
                Tenants log in to access their dashboard and records securely.
              </p>
            </div>

            <div className="rounded-xl border p-5">
              <div className="text-sm font-semibold">2) See balances</div>
              <p className="mt-2 text-sm text-gray-700">
                Dashboard shows rent vs bills/charges balances clearly.
              </p>
            </div>

            <div className="rounded-xl border p-5">
              <div className="text-sm font-semibold">3) Upload receipts</div>
              <p className="mt-2 text-sm text-gray-700">
                Upload payment receipts; admin verifies and updates status.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/login/tenant"
              className="inline-flex rounded bg-black px-5 py-3 text-sm text-white"
            >
              Continue to Tenant Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-600 flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} My House Records</div>
          <div className="text-xs">
            Secure tenant portal. Admin access is private and not shown publicly.
          </div>
        </div>
      </footer>
    </main>
  );
}
