import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white p-4 font-semibold">
        My House Records — Admin
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
