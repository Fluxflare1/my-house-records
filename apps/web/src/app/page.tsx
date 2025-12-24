import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">My House Records</h1>
      <p className="text-sm text-gray-700">
        Choose where to go:
      </p>

      <div className="space-y-2 text-sm">
        <div>
          <Link className="underline" href="/login/admin">Admin Login</Link>
        </div>
        <div>
          <Link className="underline" href="/login/tenant">Tenant Login</Link>
        </div>
        <div>
          <Link className="underline" href="/logout">Logout</Link>
        </div>
      </div>
    </div>
  );
}
