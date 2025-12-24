"use client";

import { useEffect } from "react";
import { logout } from "@/app/actions/auth-logout";

export default function LogoutPage() {
  useEffect(() => {
    (async () => {
      await logout();
      window.location.href = "/";
    })();
  }, []);

  return (
    <div className="p-6 text-sm text-gray-700">
      Logging out...
    </div>
  );
}
