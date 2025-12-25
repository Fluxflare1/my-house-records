import Link from "next/link";

export const metadata = {
  title: "My House"
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">My House</div>
          <nav className="flex items-center gap-3">
            <Link className="text-sm hover:underline" href="/login/tenant">
              Tenant Login
            </Link>
            <Link className="text-sm hover:underline" href="/admin/login">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-6xl px-4 py-14">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
            Simple records for apartments, occupancy, rent, bills, and payments.
          </h1>
          <p className="mt-3 text-gray-600">
            Track who occupied which apartment, for what period, and the exact financial state of that period.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/login/tenant"
              className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Login
            </Link>

            <Link
              href="/request-access"
              className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Request for Access
            </Link>
          </div>
        </div>

        {/* Minimal “Available” section (no pictures) */}
        <section className="mt-14 rounded-lg border bg-gray-50 p-6">
          <h2 className="text-lg font-semibold">Available Units</h2>
          <p className="mt-1 text-sm text-gray-600">
            Check availability by apartment type and preferred area. For inspection, contact admin.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/request-access"
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Request for Access
            </Link>
            <Link
              href="/contact"
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-600">
          © {new Date().getFullYear()} My House
        </div>
      </footer>
    </div>
  );
}
