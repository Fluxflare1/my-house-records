import "server-only";
import { redirect } from "next/navigation";
import { getApplicantSession } from "@/lib/auth/session";

export async function requireApplicant() {
  const session = await getApplicantSession();
  if (!session.applicant) redirect("/login/applicant");
  return session.applicant;
}
