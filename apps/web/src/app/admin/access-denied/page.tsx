import Link from "next/link";

export default function AdminAccessDeniedPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Access denied</h1>
      <p className="text-sm text-gray-700">
        You don’t have permission to view this page. Contact the main admin to grant access.
      </p>

      <div className="flex gap-2">
        <Link className="rounded border px-4 py-2 text-sm" href="/admin">
          Back to Admin Home
        </Link>
        <Link className="rounded bg-black px-4 py-2 text-white text-sm" href="/logout">
          Logout
        </Link>
      </div>
    </div>
  );
}
