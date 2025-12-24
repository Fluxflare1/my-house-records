export default function AdminHome() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="text-sm text-gray-700">
        Use the links below to manage records. (UI is intentionally minimal.)
      </p>

      <ul className="list-disc pl-6 text-sm">
        <li>/admin/setup</li>
        <li>/admin/occupancy</li>
        <li>/admin/rent</li>
        <li>/admin/bills</li>
      </ul>
    </div>
  );
}
