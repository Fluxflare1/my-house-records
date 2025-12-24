export default function AdminHome() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="text-sm text-gray-700">
        UI is intentionally minimal. It is built on server actions only.
      </p>

      <ul className="list-disc pl-6 text-sm space-y-1">
        <li>/admin/setup</li>
        <li>/admin/occupancy</li>
        <li>/admin/rent</li>
        <li>/admin/bills</li>
        <li>/admin/payments</li>
        <li>/admin/allocations</li>
        <li>/admin/statements</li>
      </ul>
    </div>
  );
}
