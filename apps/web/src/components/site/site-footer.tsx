"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteFooter() {
  const pathname = usePathname();

  // Hide public footer on admin routes
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer id="contact" className="border-t bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3">
        <div>
          <div className="text-sm font-semibold">My House</div>
          <p className="mt-2 text-sm text-gray-600">
            Occupancy history, rent, bills, payments, receipts and statements—kept clean and traceable by period.
          </p>
        </div>

        <div>
          <div className="text-sm font-semibold">Quick links</div>
          <div className="mt-2 flex flex-col gap-2 text-sm">
            <a className="text-gray-700 hover:text-black" href="/#features">Features</a>
            <a className="text-gray-700 hover:text-black" href="/#availability">Availability</a>
            <Link className="text-gray-700 hover:text-black" href="/login/tenant">Tenant Login</Link>
            <Link className="text-gray-700 hover:text-black" href="/admin/login">Admin Login</Link>
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold">Contact</div>
          <p className="mt-2 text-sm text-gray-600">
            Use the contact button on the page to reach the house manager.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            (Admin can later control and publish contact info from Settings.)
          </p>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} My House</span>
          <span>Private use</span>
        </div>
      </div>
    </footer>
  );
}
