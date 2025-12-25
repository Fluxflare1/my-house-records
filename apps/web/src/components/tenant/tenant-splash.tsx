"use client";

export default function TenantSplash({ title = "Loading your dashboard..." }: { title?: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 space-y-4">
        <div className="text-xs uppercase tracking-wide text-gray-600">My House Records</div>
        <div className="text-lg font-semibold">{title}</div>

        <div className="space-y-2">
          <div className="h-2 w-full rounded bg-gray-100 overflow-hidden">
            <div className="h-2 w-1/2 bg-black animate-pulse" />
          </div>
          <div className="text-sm text-gray-700">
            Please wait… fetching your apartment, balances, and statements.
          </div>
        </div>

        <div className="text-xs text-gray-500">
          If this takes too long, tap “Refresh” after loading.
        </div>
      </div>
    </div>
  );
}
