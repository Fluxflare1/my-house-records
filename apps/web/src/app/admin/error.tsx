"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

function getMsg(err: any) {
  return String(err?.message || err || "").trim();
}

export default function AdminErrorBoundary({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    const msg = getMsg(error);

    // Permission errors → friendly page
    if (msg.includes("ADMIN_PERMISSION_DENIED")) {
      router.replace("/admin/access-denied");
      return;
    }

    // Auth errors → login
    if (msg.includes("ADMIN_AUTH_REQUIRED")) {
      router.replace("/admin/login");
      return;
    }
  }, [error, router]);

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-gray-700">
        An unexpected error occurred while loading this admin page.
      </p>

      <div className="flex gap-2">
        <button className="rounded bg-black px-4 py-2 text-white text-sm" onClick={() => reset()}>
          Try again
        </button>
        <button className="rounded border px-4 py-2 text-sm" onClick={() => router.replace("/admin")}>
          Go to Admin Home
        </button>
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer font-semibold">Error details</summary>
        <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs">
          {getMsg(error)}
        </pre>
      </details>
    </div>
  );
}
