export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-14">
      <div className="max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
          Simple records for apartments, occupancy, rent, bills, and payments.
        </h1>

        <p className="mt-3 text-gray-600">
          Track who occupied which apartment, for what period, and the exact financial state of that period.
        </p>

        <div id="features" className="mt-12 rounded-lg border bg-gray-50 p-6">
          <h2 className="text-lg font-semibold">Features</h2>
          <ul className="mt-3 list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>Apartment + occupancy history</li>
            <li>Yearly rent tracking (supports part payments)</li>
            <li>Monthly bills/charges</li>
            <li>Payments + allocations + statements</li>
          </ul>
        </div>

        <section id="availability" className="mt-10 rounded-lg border bg-gray-50 p-6">
          <h2 className="text-lg font-semibold">Available Units</h2>
          <p className="mt-1 text-sm text-gray-600">
            Check availability by apartment type and preferred area. For inspection, contact admin.
          </p>
        </section>
      </div>
    </main>
  );
}
