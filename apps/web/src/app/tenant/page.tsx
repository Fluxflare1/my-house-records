export default function TenantHome() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Tenant Portal</h1>
      <p className="text-sm text-gray-700">
        Enter your Tenant ID to view your records. (Auth will be added later.)
      </p>

      <ul className="list-disc pl-6 text-sm space-y-1">
        <li>/tenant/dashboard</li>
        <li>/tenant/submit-receipt</li>
      </ul>
    </div>
  );
}
