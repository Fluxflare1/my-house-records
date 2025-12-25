import type { ReactNode } from "react";
import { requireApplicant } from "@/lib/auth/applicant-guards";

export default async function ApplicantLayout({ children }: { children: ReactNode }) {
  await requireApplicant();
  return <div className="mx-auto max-w-4xl px-4 py-10">{children}</div>;
}
