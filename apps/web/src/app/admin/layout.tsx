import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Do not do auth redirects here.
  // Middleware + per-page guards/actions handle auth safely.
  return children;
}
