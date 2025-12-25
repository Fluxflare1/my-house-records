import Link from "next/link";
import { requireApplicant } from "@/lib/auth/applicant-guards";
import { getApplicantById } from "@/lib/applicants/applicants-repo";

export const metadata = {
  title: "Applicant — My House"
};

export default async function ApplicantDashboard() {
  const sess = await requireApplicant();
  const row = await getApplicantById(sess.applicantId);

  const status = (row?.status || sess.status || "DRAFT").toUpperCase();
  const kycStatus = (row?.kyc_status || sess.kycStatus || "INCOMPLETE").toUpperCase();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Application Status</h1>
      <p className="mt-2 text-sm text-gray-600">
        Track your application and next steps.
      </p>

      <div className="mt-6 rounded-lg border bg-white p-5">
        <div className="text-sm">
          <span className="font-medium">Status:</span>{" "}
          <span className="rounded-md border px-2 py-1 text-xs">{status}</span>
        </div>

        <div className="mt-3 text-sm">
          <span className="font-medium">KYC:</span>{" "}
          <span className="rounded-md border px-2 py-1 text-xs">{kycStatus}</span>
        </div>

        {kycStatus !== "SUBMITTED" ? (
          <div className="mt-5 rounded-md border bg-gray-50 p-4 text-sm">
            You must complete your application form.
            <div className="mt-3">
              <Link className="rounded-md bg-black px-3 py-2 text-white text-sm hover:opacity-90" href="/applicant/kyc">
                Continue KYC
              </Link>
            </div>
          </div>
        ) : status === "PENDING_APPROVAL" ? (
          <div className="mt-5 rounded-md border bg-gray-50 p-4 text-sm">
            Your application has been submitted. Please wait for admin review (up to 3 working days).
          </div>
        ) : status === "APPROVED" ? (
          <div className="mt-5 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-900">
            Approved. Admin will provide payment advice and bonding after confirmation.
          </div>
        ) : status === "REJECTED" ? (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            Your application was not approved.
          </div>
        ) : (
          <div className="mt-5 rounded-md border bg-gray-50 p-4 text-sm">
            Keep your details up to date.
          </div>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-600">
        Need help? Use the <a className="underline" href="/#contact">contact section</a>.
      </div>
    </div>
  );
}
